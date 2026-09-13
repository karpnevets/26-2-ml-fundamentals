import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {defaultColabUrl,validColabUrl} from '../lib/colab';
test('Colab links accept only supported notebooks and all defaults exist',()=>{
  for(let week=0;week<=8;week++){
    assert(validColabUrl(defaultColabUrl(week)));
    assert(fs.existsSync(`notebooks/week-${week}.ipynb`));
  }
  assert(validColabUrl(''));assert(validColabUrl('https://colab.research.google.com/drive/abc-123'));
  for(const url of ['javascript:alert(1)','https://evil.example/drive/a','https://colab.research.google.com.evil.example/drive/a','https://user:pass@colab.research.google.com/drive/a','http://colab.research.google.com/drive/a','https://colab.research.google.com/redirect?url=evil'])assert(!validColabUrl(url));
});
test('Colab migration preserves existing lessons and supports hidden/custom links',async()=>{
  const db=new PGlite();try{
    await db.exec(fs.readFileSync('db/migrations/001_initial.sql','utf8'));
    await db.exec(fs.readFileSync('db/migrations/002_course_editor.sql','utf8'));
    await db.exec("INSERT INTO lesson_edits(week,body,revision) VALUES(2,'edited body',3)");
    const before=await db.query("SELECT to_jsonb(lesson_edits)->>'colab_url' AS url FROM lesson_edits");
    assert.equal(before.rows[0].url,null);
    const migration=fs.readFileSync('db/migrations/003_colab_links.sql','utf8');await db.exec(migration);await db.exec(migration);
    const row=(await db.query('SELECT * FROM lesson_edits')).rows[0];
    assert.equal(row.body,'edited body');assert.equal(row.revision,3);assert.equal(row.colab_url,null);
    await db.query('UPDATE lesson_edits SET colab_url=$1 WHERE week=2',['']);
    assert.equal((await db.query('SELECT colab_url FROM lesson_edits')).rows[0].colab_url,'');
    await db.query('UPDATE lesson_edits SET colab_url=$1 WHERE week=2',[defaultColabUrl(2)]);
    assert.equal((await db.query('SELECT colab_url FROM lesson_edits')).rows[0].colab_url,defaultColabUrl(2));
  }finally{await db.close();}
});
