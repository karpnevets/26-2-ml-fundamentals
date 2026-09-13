import fs from 'node:fs';
const numpy=`import sys
import numpy as np
import matplotlib.pyplot as plt
np.random.seed(42)
print('Python:', sys.version.split()[0], '| NumPy:', np.__version__)
`;
const torch=numpy+`import torch
from torch import nn
torch.manual_seed(42)
torch.set_num_threads(1)
device = torch.device('cpu')  # 기본 실습은 GPU가 필요 없습니다.
print('PyTorch:', torch.__version__, '| device:', device)
`;
const labs=[
 {title:'Python / Colab 준비',goal:'변수·함수·반복문을 실행하고 NumPy 배열의 shape를 읽습니다.',setup:numpy,
 predict:'predict(3, 2)는 무엇을 반환할까요? X의 행과 열은 각각 무엇을 의미할까요?',params:`weight = 2.0  # Apply: 3.0으로 바꿔 보세요.
`,code:`def predict(x, w):
    return w * x

X = np.array([[1., 2.], [3., 4.], [5., 6.]])
print('X shape:', X.shape, '| samples:', X.shape[0], '| features:', X.shape[1])
for x in [1, 2, 3]:
    print('input:', x, 'prediction:', predict(x, weight))
print('첫 번째 sample:', X[0])
print('두 번째 feature:', X[:, 1])
assert X.shape == (3, 2)
`,apply:'weight를 바꾸고 아래 셀을 다시 실행하세요. X에 행 하나를 추가한 뒤 shape와 첫 번째 sample을 확인하세요.',explore:'Python list의 * 2와 NumPy array의 * 2는 같은 연산일까요? 각각 실행해 차이를 설명하세요.'},
 {title:'Model & Loss',goal:'parameter가 예측을 바꾸고, loss가 예측 오차를 요약함을 확인합니다.',setup:numpy,
 predict:'데이터가 y=3x를 따른다면 w=1과 w=3 중 어느 쪽의 loss가 작을까요?',params:`w = 1.0  # Apply: 0, 2, 3, 4를 비교하세요.
`,code:`x = np.array([1., 2., 3., 4.])
y = 3 * x
prediction = w * x
loss = np.mean((prediction - y) ** 2)
print('prediction:', prediction, '| target:', y, '| MSE:', loss)
grid = np.linspace(-1, 6, 100)
losses = [np.mean((v*x-y)**2) for v in grid]
fig, ax = plt.subplots(1, 2, figsize=(10, 3))
ax[0].scatter(x, y, label='target'); ax[0].plot(x, prediction, label='prediction')
ax[0].legend(); ax[0].set(xlabel='x', ylabel='y')
ax[1].plot(grid, losses); ax[1].scatter([w], [loss], color='red')
ax[1].set(xlabel='w', ylabel='MSE'); plt.show()
assert np.isclose(np.mean((3*x-y)**2), 0)
`,apply:'w를 바꿔 MSE를 기록하세요. parameter, prediction, target 중 학습이 바꾸는 것은 무엇인가요?',explore:'y에 고정된 noise를 더해 보세요. 모든 sample의 오차가 동시에 0이 될 수 있나요?'},
 {title:'Gradient Descent',goal:'미분을 사용해 parameter를 갱신하고 learning rate의 영향을 비교합니다.',setup:numpy,
 predict:'L(w)=(w−3)²에서 w=0의 gradient 부호는? w는 증가해야 할까요, 감소해야 할까요?',params:`learning_rate = 0.1  # Apply: 0.01, 0.5, 1.1 비교
steps = 30
initial_w = 0.0
`,code:`w = initial_w
history = [w]
for step in range(steps):
    gradient = 2 * (w - 3)
    w = w - learning_rate * gradient
    history.append(w)
history = np.array(history)
print('first update:', history[1], '| final w:', w, '| final loss:', (w-3)**2)
fig, ax = plt.subplots(1, 2, figsize=(10, 3))
ax[0].plot(history); ax[0].axhline(3, color='gray', linestyle='--')
ax[0].set(xlabel='step', ylabel='w')
ax[1].plot((history-3)**2); ax[1].set(xlabel='step', ylabel='loss')
plt.show()
eps = 1e-5
numeric = (((initial_w+eps)-3)**2 - ((initial_w-eps)-3)**2)/(2*eps)
assert np.isclose(numeric, 2*(initial_w-3), atol=1e-4)
`,apply:'학습률만 바꾸고 parameter 셀부터 다시 실행하세요. 느린 수렴·빠른 수렴·발산을 표로 비교하세요.',explore:'L(w)를 (2w−3)²로 바꾸면 gradient는 무엇일까요? Chain rule을 적용해 코드와 수치 미분 검사를 함께 수정하세요.'},
 {title:'Linear Classification',goal:'여러 feature의 가중합이 2차원 decision boundary를 만드는 과정을 봅니다.',setup:numpy,
 predict:'w=[1,−1], b=0이면 x₁=x₂인 점의 score는? b를 키우면 양성 영역은 어떻게 바뀔까요?',params:`w = np.array([1., -1.])
b = 0.0  # Apply: -1, 1 비교
`,code:`rng = np.random.default_rng(42)
X = rng.normal(size=(100, 2))
y = (X[:, 0] > X[:, 1]).astype(int)
scores = X @ w + b
predicted = (scores >= 0).astype(int)
print('dot product example:', X[0] @ w, '| accuracy:', np.mean(predicted == y))
u, v = np.meshgrid(np.linspace(-3, 3, 150), np.linspace(-3, 3, 150))
z = w[0]*u + w[1]*v + b
plt.contourf(u, v, z >= 0, alpha=.2)
plt.contour(u, v, z, levels=[0], colors='black')
plt.scatter(X[:, 0], X[:, 1], c=y, cmap='coolwarm', edgecolors='white')
plt.xlabel('feature 1'); plt.ylabel('feature 2'); plt.show()
assert scores.shape == (100,)
`,apply:'w의 두 성분과 b를 하나씩 바꾸세요. 경계의 회전과 평행 이동을 구분해 설명하세요.',explore:'잘못 분류한 sample 하나를 골라 perceptron update를 직접 구현해 보세요. 학습 전후 경계가 어떻게 달라지나요?'},
 {title:'Feature Space',goal:'원형 데이터를 새로운 feature로 표현하면 선형 분리가 쉬워짐을 확인합니다.',setup:numpy,
 predict:'원의 안과 밖을 직선 하나로 나눌 수 있을까요? r²=x₁²+x₂²로 표현하면 어떨까요?',params:`radius_threshold = 1.0  # Apply: 0.5, 1.5 비교
`,code:`rng = np.random.default_rng(42)
X = rng.uniform(-2, 2, (300, 2))
r2 = (X ** 2).sum(axis=1)
y = (r2 > 1).astype(int)
prediction = (r2 > radius_threshold).astype(int)
fig, ax = plt.subplots(1, 2, figsize=(10, 3))
ax[0].scatter(X[:, 0], X[:, 1], c=y, cmap='coolwarm', s=15)
ax[0].set(xlabel='x1', ylabel='x2'); ax[0].set_aspect('equal')
ax[1].scatter(r2, np.zeros_like(r2), c=y, cmap='coolwarm', s=15)
ax[1].axvline(radius_threshold, color='black'); ax[1].set(xlabel='new feature: r squared', yticks=[])
plt.show(); print('accuracy:', np.mean(prediction == y))
assert np.allclose(r2, X[:, 0]**2 + X[:, 1]**2)
`,apply:'threshold를 바꾸고 분류 오류가 어느 위치에서 생기는지 확인하세요. 새 공간에서 경계가 선형인 이유를 적으세요.',explore:'XOR의 네 점을 만들어 x₁·x₂를 feature로 추가해 보세요. 0/1 표현과 −1/+1 표현에서 각각 어떤 경계를 쓸 수 있나요?'},
 {title:'MLP & Representation',goal:'PyTorch autograd와 비선형 activation으로 XOR를 학습합니다.',setup:torch,
 predict:'Linear layer만 여러 개 쌓으면 XOR를 풀 수 있을까요? ReLU는 무엇을 바꾸나요?',params:`use_activation = True  # Apply: False와 비교
hidden_size = 8
steps = 500
`,code:`torch.manual_seed(42)
X = torch.tensor([[0.,0.],[0.,1.],[1.,0.],[1.,1.]])
y = torch.tensor([[0.],[1.],[1.],[0.]])
model = nn.Sequential(nn.Linear(2, hidden_size),
                      nn.ReLU() if use_activation else nn.Identity(),
                      nn.Linear(hidden_size, 1))
optimizer = torch.optim.Adam(model.parameters(), lr=0.03)
criterion = nn.BCEWithLogitsLoss()
losses = []
for step in range(steps):
    optimizer.zero_grad()
    logits = model(X)
    loss = criterion(logits, y)
    loss.backward()  # autograd가 각 parameter의 gradient를 계산
    optimizer.step()
    losses.append(loss.item())
with torch.no_grad():
    probabilities = torch.sigmoid(model(X))
print('probabilities:', probabilities.squeeze().tolist())
print('predictions:', (probabilities >= .5).int().squeeze().tolist())
plt.plot(losses); plt.xlabel('step'); plt.ylabel('BCE loss'); plt.show()
assert model(X).shape == y.shape
`,apply:'activation만 제거하고 parameter 셀부터 다시 실행하세요. hidden_size를 늘리는 것만으로 문제가 해결되나요?',explore:'학습된 첫 번째 Linear+ReLU 출력을 인쇄해 hidden representation을 비교하세요. loss.backward()를 생략하면 어떤 일이 생기나요?'},
 {title:'Training & Generalization',goal:'batch·epoch·logit·CrossEntropyLoss를 연결하고 학습/검증 데이터를 분리합니다.',setup:torch,
 predict:'학습 loss가 낮아지면 새 데이터의 정확도도 항상 좋아질까요? batch size가 16이면 64개 sample에서 1 epoch에 몇 번 갱신할까요?',params:`epochs = 40
batch_size = 16
hidden_size = 32  # Apply: 4, 128 비교
`,code:`torch.manual_seed(42)
def make_data(n):
    x = torch.randn(n, 2)
    y = (x[:,0]*x[:,1] + .3*torch.randn(n) > 0).long()
    return x, y
train_x, train_y = make_data(64)
valid_x, valid_y = make_data(256)  # validation은 backward에 사용하지 않음
model = nn.Sequential(nn.Linear(2, hidden_size), nn.ReLU(), nn.Linear(hidden_size, 2))
optimizer = torch.optim.Adam(model.parameters(), lr=.02)
criterion = nn.CrossEntropyLoss()  # raw logits를 전달. softmax를 미리 적용하지 않음.
train_history, valid_history = [], []
for epoch in range(epochs):
    model.train()
    order = torch.randperm(len(train_x))
    for start in range(0, len(order), batch_size):
        indices = order[start:start+batch_size]
        optimizer.zero_grad()
        loss = criterion(model(train_x[indices]), train_y[indices])
        loss.backward(); optimizer.step()
    model.eval()
    with torch.no_grad():
        train_history.append(criterion(model(train_x), train_y).item())
        valid_history.append(criterion(model(valid_x), valid_y).item())
with torch.no_grad():
    accuracy = (model(valid_x).argmax(1)==valid_y).float().mean().item()
print('validation accuracy:', round(accuracy,3), '| batches/epoch:', int(np.ceil(len(train_x)/batch_size)))
plt.plot(train_history,label='train'); plt.plot(valid_history,label='validation')
plt.xlabel('epoch'); plt.ylabel('cross entropy'); plt.legend(); plt.show()
assert model(valid_x).shape == (256,2)
`,apply:'epochs와 hidden_size를 각각 바꿔 학습/검증 loss의 차이를 기록하세요. 검증 데이터에 맞춰 반복 조정했다면 최종 평가에는 별도 test set이 필요합니다.',explore:'train sample 수를 늘리거나 weight_decay를 추가해 보세요. 한 번의 실행 결과만으로 일반화 성능을 단정할 수 없는 이유는 무엇인가요?'},
 {title:'Convolutional Networks',goal:'작은 이미지에서 filter·feature map·pooling을 보고 CNN을 학습합니다.',setup:torch,
 predict:'8×8 이미지에 3×3 filter, padding=1이면 출력 크기는? 2×2 pooling 뒤에는 어떻게 되나요?',params:`noise = 0.15  # Apply: 0.05, 0.4 비교
epochs = 40
`,code:`torch.manual_seed(42)
def images(n):
    y = torch.randint(0,2,(n,))
    x = noise*torch.randn(n,1,8,8)
    for i in range(n):
        if y[i]==0: x[i,0,:,3:5] += 1  # vertical bar
        else: x[i,0,3:5,:] += 1  # horizontal bar
    return x,y
train_x, train_y = images(128)
test_x, test_y = images(64)
model = nn.Sequential(nn.Conv2d(1,4,3,padding=1),nn.ReLU(),nn.MaxPool2d(2),
                      nn.Flatten(),nn.Linear(4*4*4,2))
optimizer=torch.optim.Adam(model.parameters(),lr=.02)
criterion=nn.CrossEntropyLoss()
for epoch in range(epochs):
    optimizer.zero_grad(); loss=criterion(model(train_x),train_y)
    loss.backward(); optimizer.step()
with torch.no_grad():
    feature_maps=model[1](model[0](test_x[:1]))
    print('feature map shape:',tuple(feature_maps.shape))
    print('test accuracy:',(model(test_x).argmax(1)==test_y).float().mean().item())
fig,ax=plt.subplots(1,3,figsize=(9,3))
ax[0].imshow(test_x[0,0],cmap='gray'); ax[0].set_title('input')
ax[1].imshow(model[0].weight[0,0].detach(),cmap='coolwarm'); ax[1].set_title('learned filter')
ax[2].imshow(feature_maps[0,0],cmap='viridis'); ax[2].set_title('feature map')
plt.show()
assert model[2](feature_maps).shape == (1,4,4,4)
`,apply:'noise를 늘리고 정확도와 feature map을 비교하세요. filter는 사람이 고정한 것인가요, loss로 학습한 것인가요?',explore:'막대의 위치도 무작위로 바꾸도록 images를 수정하세요. Flatten 대신 global average pooling을 사용하면 어떤 차이가 날까요? 실제 이미지 성능은 이 장난감 데이터만으로 판단할 수 없습니다.'},
 {title:'Residual Learning & ResNet',goal:'skip connection의 shape와 gradient 경로를 확인하고 작은 residual MLP를 비교합니다.',setup:torch,
 predict:'F(x)=0일 때 x+F(x)의 출력은? plain block의 출력은? 더 깊은 모델이 항상 더 좋은 결과를 낼까요?',params:`depth = 6  # Apply: 2, 12 비교
steps = 100
learning_rate = 0.01
`,code:`x=torch.tensor([[1.,2.,3.]],requires_grad=True)
residual=x+0*x
residual.sum().backward()
print('F=0 output:',residual.detach(),'| gradient to x:',x.grad)
assert torch.allclose(x.grad,torch.ones_like(x))

class Block(nn.Module):
    def __init__(self,width,residual):
        super().__init__(); self.linear=nn.Linear(width,width); self.residual=residual
    def forward(self,x):
        f=torch.relu(self.linear(x))
        return x+f if self.residual else f

def make_model(residual):
    return nn.Sequential(nn.Linear(1,8),*[Block(8,residual) for _ in range(depth)],nn.Linear(8,1))

train_x=torch.linspace(-2,2,128).reshape(-1,1)
train_y=torch.sin(2*train_x)
results={}
for label,use_skip in [('plain',False),('residual',True)]:
    torch.manual_seed(42)  # 同じ形のparameterを同じ初期値で比較
    model=make_model(use_skip)
    optimizer=torch.optim.Adam(model.parameters(),lr=learning_rate)
    history=[]
    for step in range(steps):
        optimizer.zero_grad(); loss=((model(train_x)-train_y)**2).mean()
        loss.backward(); optimizer.step(); history.append(loss.item())
    results[label]=history
    plt.plot(history,label=label)
plt.xlabel('step');plt.ylabel('training MSE');plt.legend();plt.show()
print({name:round(values[-1],4) for name,values in results.items()})
`,apply:'depth만 바꿔 학습 곡선을 비교하세요. 어떤 설정에서는 residual이 더 나쁠 수도 있습니다. 이 실험은 CNN ResNet 전체가 아닌 skip connection 원리 실험입니다.',explore:'CNN block의 F에 Conv2d 두 개를 사용해 보세요. 채널 수나 해상도가 바뀌면 x+F(x)를 위해 어떤 projection이 필요할까요? BatchNorm, 초기화, 학습률까지 통제하지 않고 성능 차이를 일반화할 수 있을까요?'},
];
const md=source=>({cell_type:'markdown',metadata:{},source:source.split(/(?<=\n)/)});
const code=source=>({cell_type:'code',metadata:{},execution_count:null,outputs:[],source:source.split(/(?<=\n)/)});
fs.mkdirSync('notebooks',{recursive:true});
labs.forEach((lab,week)=>{
 const cells=[md(`# Week ${week} · ${lab.title}\n\n${lab.goal}\n\n[강의로 돌아가기](https://ml-fundamentals-karpnet.vercel.app/week/${week})\n\n**사용법**: 파일 → Drive에 사본 저장 → 위에서 아래로 실행하세요. 런타임을 다시 시작했다면 설정 셀부터 다시 실행합니다. CPU 기준의 짧은 실습이며 데이터 다운로드가 없습니다. 실행 결과는 사이트에 자동 저장되지 않습니다.\n`),md('## 1. 실행 준비\n\nColab 기본 Python 런타임의 NumPy·Matplotlib'+(week>=5?'·PyTorch':'')+'를 사용합니다. import 오류가 나면 새 기본 런타임으로 연결하세요.\n'),code(lab.setup),md('## 2. 실행 전 예상\n\n'+lab.predict+'\n\n아래 칸에 예상과 이유를 먼저 적으세요.\n'),md('**내 예상:**\n\n(여기에 작성)\n'),md('## 3. 실행하고 관찰하기\n\n아래 parameter를 확인하고 두 코드 셀을 순서대로 실행하세요.\n'),code(lab.params),code(lab.code.replace('同じ形のparameterを同じ初期値で比較','같은 형태의 parameter를 같은 초기값으로 비교')),md('## 4. Apply · 한 가지씩 바꾸기\n\n'+lab.apply+'\n\nparameter를 바꿀 때는 parameter 셀과 아래 실행 셀을 모두 다시 실행하세요.\n'),md('| 바꾼 값 | 실행 전 예상 | 실제 결과 | 설명 |\n|---|---|---|---|\n| 기본값 | | | |\n| 변경 1 | | | |\n| 변경 2 | | | |\n'),md('## 5. Explore · 선택 확장\n\n'+lab.explore+'\n'),code('# 선택 확장 코드를 여기에 작성하세요.\n'),md('## 6. 내 말로 설명하기\n\n- 예상과 결과가 달랐던 점은?\n- 이번 실습을 한 문장으로 설명하면?\n- 아직 설명하기 어려운 부분은?\n\n답을 자신의 Drive 사본에 남긴 뒤 [사이트로 돌아가 학습 기록을 체크](https://ml-fundamentals-karpnet.vercel.app/week/'+week+')하세요. 노트북 실행만으로 주차 잠금이나 완료 기록이 자동 변경되지는 않습니다.\n')];
 cells.forEach((c,i)=>c.id=`w${week}-cell-${i}`);
 fs.writeFileSync(`notebooks/week-${week}.ipynb`,JSON.stringify({nbformat:4,nbformat_minor:5,metadata:{kernelspec:{display_name:'Python 3',language:'python',name:'python3'},language_info:{name:'python'},colab:{name:`Week ${week} - ${lab.title}.ipynb`,provenance:[]}},cells},null,2)+'\n');
});
console.log('Generated 9 course notebooks.');
