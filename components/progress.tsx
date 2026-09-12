"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { localProgress, type ProgressValues } from "@/lib/progress-policy";
type User = { id: string; email: string; name: string; isAdmin: boolean };
type Mode = "loading" | "local" | "guest" | "account" | "unavailable" | "error";
type State = {
  values: ProgressValues;
  toggle: (id: string) => void;
  ready: boolean;
  busy: boolean;
  mode: Mode;
  user: User | null;
  message: string;
  retry: () => void;
  importLocal: () => void;
  localCount: number;
};
const Context = createContext<State>({
  values: {},
  toggle: () => {},
  ready: false,
  busy: false,
  mode: "loading",
  user: null,
  message: "",
  retry: () => {},
  importLocal: () => {},
  localCount: 0,
});
const LOCAL_KEY = "ml-sig-progress-v1";
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<ProgressValues>({}),
    [mode, setMode] = useState<Mode>("loading"),
    [user, setUser] = useState<User | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [storageNotice, setStorageNotice] = useState(false),
    [localCount, setLocalCount] = useState(0);
  const lock = useRef(false),
    generation = useRef(0);
  function readLocal() {
    try {
      return localProgress(JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"));
    } catch {
      setStorageNotice(true);
      return {};
    }
  }
  async function initialize() {
    const ticket = ++generation.current;
    setMode("loading");
    setUser(null);
    setValues({});
    setMessage("");
    try {
      const response = await fetch("/api/me", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (ticket !== generation.current) return;
      if (data.mode === "account" && data.user) {
        const progress = await fetch("/api/progress", { cache: "no-store" });
        if (!progress.ok) throw new Error();
        const body = await progress.json();
        if (ticket !== generation.current) return;
        if (body.ownerId !== data.user.id) throw new Error();
        setValues(localProgress(body.values));
        setUser(data.user);
        setMode("account");
        setLocalCount(Object.values(readLocal()).filter(Boolean).length);
      } else if (data.mode === "local" || data.mode === "guest") {
        setValues(readLocal());
        setMode(data.mode);
        setLocalCount(0);
      } else {
        setMode("unavailable");
        setMessage(
          "로그인·기록 저장 서비스가 아직 준비되지 않았습니다. 강의는 계속 읽을 수 있습니다.",
        );
      }
    } catch {
      if (ticket === generation.current) {
        setMode("error");
        setMessage(
          "학습 기록을 불러오지 못했습니다. 연결을 확인한 뒤 다시 시도하세요.",
        );
      }
    }
  }
  useEffect(() => {
    void initialize();
    return () => {
      generation.current++;
    };
  }, []);
  async function toggle(id: string) {
    if (lock.current || !["local", "guest", "account"].includes(mode)) return;
    const next = { ...values, [id]: !values[id] };
    setMessage("");
    if (mode !== "account") {
      setValues(next);
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      } catch {
        setStorageNotice(true);
      }
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      const response = await fetch("/api/progress", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Progress-Owner": user!.id,
        },
        body: JSON.stringify({ id, completed: next[id] }),
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 409) {
          setValues({});
          setUser(null);
          setMode("error");
          throw new Error("로그인이 만료되었습니다. 다시 로그인해 주세요.");
        }
        throw new Error(
          "저장하지 못했습니다. 체크 상태는 바뀌지 않았습니다. 다시 눌러 주세요.",
        );
      }
      setValues(next);
      setMessage("계정에 저장했습니다.");
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "저장하지 못했습니다. 다시 눌러 주세요.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function importLocal() {
    if (mode !== "account" || lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      const ids = Object.entries(readLocal())
        .filter(([, v]) => v)
        .map(([id]) => id);
      const response = await fetch("/api/progress/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Progress-Owner": user!.id,
        },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok)
        throw new Error("기록을 가져오지 못했습니다. 다시 시도하세요.");
      const body = await response.json();
      setValues(localProgress(body.values));
      setLocalCount(0);
      setMessage(
        `${body.imported}개 기록을 가져왔습니다. 기존 계정 기록은 유지했습니다.`,
      );
      try {
        localStorage.removeItem(LOCAL_KEY);
      } catch {
        setStorageNotice(true);
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "가져오기에 실패했습니다.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Context.Provider
      value={{
        values,
        toggle,
        ready: ["local", "guest", "account"].includes(mode),
        busy,
        mode,
        user,
        message,
        retry: () => void initialize(),
        importLocal: () => void importLocal(),
        localCount,
      }}
    >
      {storageNotice && (
        <div className="storage-note" role="status">
          이 브라우저에서는 기기 기록을 저장할 수 없습니다. 현재 페이지에서는
          계속 학습할 수 있습니다.
        </div>
      )}
      {children}
    </Context.Provider>
  );
}
export function AccountControls() {
  const { mode, user, busy } = useContext(Context);
  return (
    <div className="account-controls">
      {mode === "loading" ? (
        <span className="muted">계정 확인 중</span>
      ) : user ? (
        <>
          <span className="account-name" title={user.email}>
            {user.name || user.email}
          </span>
          {user.isAdmin && <Link href="/admin">진행 현황</Link>}
          <button
            disabled={busy}
            onClick={() => void signOut({ callbackUrl: "/" })}
          >
            로그아웃
          </button>
        </>
      ) : (
        <Link href="/login">학교 계정 로그인 ↗</Link>
      )}
    </div>
  );
}
export function ProgressNotice() {
  const { mode, message, busy, retry, importLocal, localCount, user } =
    useContext(Context);
  return (
    <div className="progress-notice">
      <div role="status" aria-live="polite">
        {busy
          ? "계정에 저장 중…"
          : message ||
            (mode === "account"
              ? `${user?.email} · 계정에 학습 기록을 저장합니다.`
              : mode === "guest"
                ? "현재 기록은 이 기기에만 저장됩니다. 로그인하면 여러 기기에서 이어갈 수 있습니다."
                : mode === "local"
                  ? "이 기기에 학습 기록을 저장합니다."
                  : mode === "loading"
                    ? "학습 기록을 확인하는 중…"
                    : "")}
      </div>
      {(mode === "error" || mode === "unavailable") && (
        <>
          <button disabled={busy} onClick={retry}>
            다시 확인
          </button>
          <Link href="/login">로그인 안내</Link>
        </>
      )}
      {mode === "account" && localCount > 0 && (
        <div className="import-notice">
          <p>
            이 브라우저에 완료 기록 {localCount}개가 있습니다. 본인의 기록이라면
            계정에 가져오세요. 기존 계정 기록을 덮어쓰지 않습니다. 가져온 후
            기기 기록은 삭제됩니다.
          </p>
          <button disabled={busy} onClick={importLocal}>
            기기 기록 가져오기
          </button>
        </div>
      )}
    </div>
  );
}
export function ProgressCheck({ id, label }: { id: string; label: string }) {
  const { values, toggle, ready, busy } = useContext(Context);
  return (
    <label className="check">
      <input
        type="checkbox"
        disabled={!ready || busy}
        checked={!!values[id]}
        onChange={() => toggle(id)}
      />
      <span>{label}</span>
    </label>
  );
}
export function WeekStatus({
  week,
  concepts,
}: {
  week: number;
  concepts: string[];
}) {
  const { values } = useContext(Context);
  const n = concepts.filter((c) => values[`w${week}:${c}`]).length;
  return (
    <span className={n === concepts.length ? "status done" : "status"}>
      {n === concepts.length
        ? "이해 완료"
        : n
          ? `${n} / ${concepts.length} 개념`
          : "학습 전"}
    </span>
  );
}
export function OverallProgress({
  weeks,
}: {
  weeks: { week: number; concepts: string[] }[];
}) {
  const { values } = useContext(Context);
  const n = weeks.filter(
    (w) => w.week > 0 && w.concepts.every((c) => values[`w${w.week}:${c}`]),
  ).length;
  return (
    <div className="overall">
      <span>나의 학습 기록</span>
      <strong>
        {n}
        <small> / 8 주차</small>
      </strong>
      <progress aria-label="이해 완료 주차" value={n} max={8} />
      <p>이해한 개념을 체크하며 채워 가세요.</p>
    </div>
  );
}
