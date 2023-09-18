// DOM
const playground = document.querySelector(".playground > ul");

// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

// ul 안에 li 20개를 넣을거임
// 그리고 각 li 안에 ul을 넣을 거고 그 ul 안에 li 10개 넣을거

// varibables
let score = 0;
let duration = 500;
let downInterval; // null값
let tempMovingItem; // moving 실질적으로 실행하기 전에 잠시 담아두는곳

const BLOCKS = {
  tree: [
    [
      // 이거는 좌표? 정확히 무슨 말인지 모르겠음
      [2, 1],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    [
      [2, 1],
      [1, 2],
      [1, 0],
      [1, 1],
    ], // 90도 돌린 모양
    [
      [2, 1],
      [0, 1],
      [1, 2],
      [1, 1],
    ], // 180도 ㅇㅇ
    [
      [1, 2],
      [0, 1],
      [1, 0],
      [1, 1],
    ], // 270도 ㅇㅇ
  ],
};

const movingItem = {
  type: "tree",
  direction: 0, // 방향키 위로 올리면 방향 돌려주는
  top: 0,
  left: 0,
};

init();

function init() {
  // 아래줄 하는 이유 : movingItem을 주기적으로 바꾸는데 바꾼값이 안맞게되면(?) 원복 시켜야함.
  tempMovingItem = { ...movingItem }; // spread operator를 사용 >> 복사해서 다른걸 갖게 됨
  // 아래처럼 값을 변경해도 콘솔 찍으면 반영 안됨
  // movingItem.left = 3;
  for (let i = 0; i < GAME_ROWS; i++) {
    prependNewLine();
  }
  renderBlocks();
}

function prependNewLine() {
  const li = document.createElement("li");
  const ul = document.createElement("ul");
  for (let j = 0; j < GAME_COLS; j++) {
    const matrix = document.createElement("li");
    ul.prepend(matrix);
  }
  li.prepend(ul);
  playground.prepend(li);
}

function renderBlocks(moveType = "") {
  // changeDirection 같은 곳에서는 인자를 안보내기 때문에 빈값으로 초기화
  const { type, direction, top, left } = tempMovingItem;
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach((moving) => {
    moving.classList.remove(type, "moving"); // 여기에서 moving도 넣어 줬는데 없어도 동작함
  });

  // forEach를 돌리면 isAvailable이 빈값이 있으면 나머지 것들을 렌더링 할필요가 없다.중간에 멈추고 싶을 떄 forEach는 반복문 중간에 break할 수 없기 때문애ㅔ
  // some으로 교체
  BLOCKS[type][direction].some((block) => {
    const x = block[0] + left;
    const y = block[1] + top;
    console.log("playground.childNodes[y] >> ", playground.childNodes[y]);

    const target = playground.childNodes[y]
      ? playground.childNodes[y].childNodes[0].childNodes[x]
      : null;
    const isAvailable = checkEmpty(target);

    if (isAvailable) {
      target.classList.add(type, "moving"); // moving을 추가해서 moving이란 클래스만 갖고 있을 때 색 칠해지도록
    } else {
      tempMovingItem = { ...movingItem };
      // 이벤트루프에 예약된 이벤트 들이 다 실행된 후에 스택에 다시 집어 넣어 실행
      setTimeout(() => {
        renderBlocks(); // 재귀함수 실행 >> call stack maximum exceed 에러 발생 가능성 있음 >> 이벤트 루프 안에 넣지말고 task queue에 넣어놨다가 실행할 수 있도록 setTimeout 0초로 설정
        if (moveType === "top") {
          // 아래로 내려가는데 바닥에 다 닿으면 고정시켜버리는 함수.
          seizeBlock();
        }
      }, 0);
      // renderBlocks(); // 재귀함수 실행 >> call stack maximum exceed 에러 발생 가능성 있음 >> 이벤트 루프 안에 넣지말고 task queue에 넣어놨다가 실행할 수 있도록 setTimeout 0초로 설정
      return true; // 원하는 시점에 반복문 중지  // 사각형 다 렌더링 할 필욘 없으니까
    }
  });
  movingItem.left = left;
  movingItem.top = top;
  movingItem.direction = direction;
}

function seizeBlock() {
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach((moving) => {
    moving.classList.remove("moving"); // 밑에 도착했으면 moving은 없애주고
    moving.classList.add("seized"); // 처박힌 클래스 추가
  });
  generateNewBlock(); // 동시에 새로운 블럭 생성.
}

function generateNewBlock() {
  movingItem.top = 0;
  movingItem.left = 3;
  movingItem.direction = 0;
  tempMovingItem = { ...movingItem };
  renderBlocks(); // 바닐라를 쓰니 랜더 해주는 함수를 항상 써줘야하네
}

function checkEmpty(target) {
  if (!target || target.classList.contains("seized")) {
    return false; // return을 안해줘서 정상 작동 안됐어
  }
  return true;
}

function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount;
  renderBlocks(moveType); // block이 움직일 떄만 렌더링 시켜
}

function changeDirection() {
  const direction = tempMovingItem.direction;
  direction === 3
    ? (tempMovingItem.direction = 0)
    : (tempMovingItem.direction += 1);
  renderBlocks();
}

document.addEventListener("keydown", (e) => {
  switch (e.keyCode) {
    case 39:
      moveBlock("left", 1);
      break;
    case 37:
      moveBlock("left", -1);
      break;
    case 40:
      moveBlock("top", 1);
      break;
    case 38:
      changeDirection();
      break;
    // case 32:
    //   moveBlock("top", 18);
    //   break;
    default:
      break;
  }
  console.log("e >> ", e);
});
