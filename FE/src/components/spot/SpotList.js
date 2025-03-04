import React, { useState, useContext } from "react";
import styled from "styled-components";
import { DeleteOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import SearchDetail from "../searchMap/SearchDetail";
import socket from "../../socket";
import { useParams } from "react-router-dom";
import { ConnectuserContext } from "../../context/ConnectUserContext";

const SidePlanListDiv = styled.div`
  height: 100%;
`;
const StyledDragDropContext = styled(DragDropContext)``;

const testItem = [
  { id: "item-1", title: "제주 공항", category: "제주 공항" },
  { id: "item-2", title: "장소2", category: "음식점 · 제주 제주시" },
  { id: "item-3", title: "장소3", category: "음식점 · 제주 제주시" },
  { id: "item-4", title: "장소4", category: "관광명소 · 제주 제주시" },
  { id: "item-5", title: "장소5", category: "카페 · 제주 제주시" },
  { id: "item-6", title: "장소6", category: "관광명소 · 제주 제주시" },
  { id: "item-7", title: "장소7", category: "숙소" },
  { id: "item-11", title: "장소1", category: "관광명소 · 제주 제주시" },
  { id: "item-21", title: "장소2", category: "관광명소 · 제주 제주시" },
  { id: "item-31", title: "장소3", category: "관광명소 · 제주 제주시" },
  { id: "item-41", title: "장소4", category: "관광명소 · 제주 제주시" },
  { id: "item-51", title: "장소5", category: "음식점 · 제주 제주시" },
  { id: "item-61", title: "장소6", category: "카페 · 제주 제주시" },
  { id: "item-71", title: "장소7", category: "음식점 · 제주 제주시" },
];
// const testItem2 = [
//   { id: "item-11", title: "장소1" },
//   { id: "item-21", title: "장소2" },
//   { id: "item-31", title: "장소3" },
//   { id: "item-41", title: "장소4" },
//   { id: "item-51", title: "장소5" },
//   { id: "item-61", title: "장소6" },
//   { id: "item-71", title: "장소7" },
// ];

let color = {
  FD6: "#975FFE",
  AT4: "#FF8A3D", // 관광, 명소
  CE7: "#FF6169", // 음식점>카페
  AD5: "#8DD664", // 숙박
  "": "#CFCFCF",
};

const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k + offset}-${new Date().getTime()}`,
    content: `item ${k + offset}`,
  }));

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};
const grid = 8;

const getListStyle = (isDraggingOver) => ({
  // background: isDraggingOver ? "rgba(183, 183, 183, 0.45)" : "white",
  // margin: "50px",
  // textAlign: "center",
  boxShadow: " inset 2px 4px 4px 2px rgba(0, 0, 0, 0.25)",
  borderRadius: "15px",
  padding: grid,
  height: "99%",
  width: 343,
  overflow: "scroll",
});

const transDayItem = (dayItem, selectedIndex) => {};

function SpotList({
  handleVisible,
  handleContents,
  dayItem,
  setItemRoute,
  selectedIndex,
  setIsDrage,
  setIsAddDel,
  userName,
}) {
  // const [state, setState] = useState([testItem, testItem2]);
  const { projectId } = useParams();
  const { connectUser, setConnectUser } = useContext(ConnectuserContext);
  // const userName = sessionStorage.getItem("myNickname");
  const getItemStyle = (isDragging, draggableStyle, color, userName) => ({
    // some basic styles to make the items look a bit nicer

    userSelect: "none",
    // height: "41px",
    margin: `0 0 ${grid / 2}px 0`,
    // change background colour if dragging
    background: isDragging ? "#EBEBEB" : "none",
    boxSizing: "border-box",
    // mozBoxSizing: "border-box",
    // webkitBoxSizing: "border-box",

    // border: `4px solid ${color}`,
    boxShadow: `inset 0px 0px 0px 3px ${color}`,
    // border: `3px solid ${color}`,
    // outline: `2px solid ${color}`,
    // outlineOffset: "-5px",

    // transitionDuration: "2s",
    // border: `${color}`,
    // ${userName} ,

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  const [state, setState] = useState([dayItem[selectedIndex]]);

  function onDragStart(result) {
    // console.log(result);
    // console.log("drag start");
    // console.log(dayItem[selectedIndex][result.source.index]);
    // console.log("사용자 색 : ", connectUser[userName].color);
    // console.log("사용자 닉네임 : ", userName);
    const newState = [...[...dayItem]];
    // console.log(newState[selectedIndex][result.source.index].lock);
    // console.log(newState[selectedIndex][result.source.index].user_name);
    const lockAcquire = newState[selectedIndex][result.source.index].user_name;
    // if username === 자기랑 다르면 못움직이게 alert
    if (
      lockAcquire === null ||
      lockAcquire === userName ||
      lockAcquire == undefined
    ) {
      newState[selectedIndex][result.source.index].lock =
        connectUser[userName].color;
      newState[selectedIndex][result.source.index].user_name = userName;
    } else {
      alert("다른 친구가 옮기고 있습니다 ! 잠시 기다려주세요!");
    }
    // newState[selectedIndex][resuslt.source.index].user_name = null;
    setItemRoute(newState);
    setIsDrage(true);

    // socket.emit("grabSpot", [projectId, userName, result.source.index]);
  }

  function onDragEnd(result) {
    const { source, destination } = result;
    // console.log("drag end");
    // dropped outside the list
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;
    if (sInd === dInd) {
      const items = reorder(
        [...dayItem][selectedIndex],
        // [dayItem[selectedIndex]][sInd],
        source.index,
        destination.index
      );

      const newState = [...[...dayItem]];
      newState[selectedIndex] = items;
      // console.log(newState[selectedIndex][result.destination.index].color);
      newState[selectedIndex][result.destination.index].user_name = null;
      newState[selectedIndex][result.destination.index].lock = "white"; //수정 예쩡

      // console.log("drag end IN newState[selectedIndex] : ", newState);
      setItemRoute(newState);
    } else {
      console.log("spot list else 여기오면ㅇ ㅏㄴ됨");
      const result = move(
        [...dayItem][sInd],
        [...dayItem][dInd],
        source,
        destination
      );
      const newState = [...[...dayItem]];
      newState[sInd] = result[sInd];
      // console.log("drag end IN newState[sInd] : ", newState[sInd]);
      newState[dInd] = result[dInd];
      // newState[dInd][result.source.index].user_name = userName;

      setItemRoute(newState);
    }
    setIsDrage(true);
  }

  return (
    <SidePlanListDiv>
      <StyledDragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        {[dayItem[selectedIndex]].map((el, ind) => (
          <Droppable key={ind} droppableId={`${ind}`}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDragging)}
                {...provided.droppableProps}
              >
                {el.map((item, index) =>
                  item.user_name === null || item.user_name === userName ? (
                    <Draggable
                      key={item.uid}
                      draggableId={item.uid}
                      index={index}
                      projectUserName={item.user_name}
                      projectLock={item.lock}
                      // isDragDisabled={true} // Drag 불가능
                    >
                      {(provided, snapshot) => (
                        <SpotListItemDiv
                          user_color={item.lock}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style,
                            item.lock,
                            item.user_name
                          )}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-evenly",
                            }}
                          >
                            <SpotItemDiv>
                              <SpotTitle
                                className="spotTitle"
                                onClick={() => {
                                  handleVisible(true), handleContents(item);
                                }}
                              >
                                <SpotItemIndex
                                  style={{
                                    background: color[item.category_group_code],
                                    width: "25px",
                                    fontSize: "13px",
                                  }}
                                >
                                  {index + 1}
                                </SpotItemIndex>
                                {item.place_name.length > 10
                                  ? item.place_name.slice(0, 11) + " ..."
                                  : item.place_name}
                                {/* {item.place_name} */}
                              </SpotTitle>
                              <SpotCategory>
                                {item.category_group_name
                                  ? item.category_group_name
                                  : "-"}
                              </SpotCategory>
                            </SpotItemDiv>
                            {item.user_name && (
                              <div
                                style={{
                                  // position: "absolute",
                                  // marginTop: "63px",
                                  // marginLeft: "270px",
                                  backgroundColor: `${item.lock}`,
                                  color: "white",
                                  padding: "2px",
                                  width: "auto",
                                  height: "20px",
                                  textAlignLast: "center",
                                  marginTop: "10px",
                                }}
                              >
                                {item.user_name}
                              </div>
                            )}
                            {!item.user_name && (
                              <DeleteOutlined
                                style={{ fontSize: "25px" }}
                                onClick={() => {
                                  const newDayItem = [...dayItem];
                                  const newState = [
                                    ...[dayItem[selectedIndex]],
                                  ];
                                  newState[ind].splice(index, 1);
                                  newDayItem[selectedIndex] = [...newState[0]];
                                  setItemRoute(newDayItem);
                                  setIsAddDel(true);
                                }}
                              />
                            )}
                          </div>
                        </SpotListItemDiv>
                      )}
                    </Draggable>
                  ) : (
                    <Draggable
                      key={item.uid}
                      draggableId={item.uid}
                      index={index}
                      projectUserName={item.user_name}
                      projectLock={item.lock}
                      isDragDisabled={true} // Drag 불가능
                    >
                      {(provided, snapshot) => (
                        <SpotListItemDiv
                          user_color={item.lock}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style,
                            item.lock,
                            item.user_name
                          )}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-evenly",
                            }}
                          >
                            <SpotItemDiv>
                              <SpotTitle
                                className="spotTitle"
                                onClick={() => {
                                  handleVisible(true), handleContents(item);
                                }}
                              >
                                <SpotItemIndex
                                  style={{
                                    background: color[item.category_group_code],
                                    width: "25px",
                                    fontSize: "13px",
                                  }}
                                >
                                  {index + 1}
                                </SpotItemIndex>
                                {item.place_name.length > 10
                                  ? item.place_name.slice(0, 11) + " ..."
                                  : item.place_name}
                                {/* {item.place_name} */}
                              </SpotTitle>
                              <SpotCategory>
                                {item.category_group_name
                                  ? item.category_group_name
                                  : "-"}
                              </SpotCategory>
                            </SpotItemDiv>
                            {item.user_name && (
                              <div
                                style={{
                                  // position: "absolute",
                                  // marginTop: "63px",
                                  // marginLeft: "270px",
                                  backgroundColor: `${item.lock}`,
                                  color: "white",
                                  padding: "2px",
                                  width: "auto",
                                  height: "20px",
                                  textAlignLast: "center",
                                  marginTop: "10px",
                                }}
                              >
                                {item.user_name}
                              </div>
                            )}
                            {!item.user_name && (
                              <DeleteOutlined
                                style={{ fontSize: "25px" }}
                                onClick={() => {
                                  const newDayItem = [...dayItem];
                                  const newState = [
                                    ...[dayItem[selectedIndex]],
                                  ];
                                  newState[ind].splice(index, 1);
                                  newDayItem[selectedIndex] = [...newState[0]];
                                  setItemRoute(newDayItem);
                                  setIsAddDel(true);
                                }}
                              />
                            )}
                          </div>
                        </SpotListItemDiv>
                      )}
                    </Draggable>
                  )
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </StyledDragDropContext>
    </SidePlanListDiv>
  );
}

const SpotItemIndex = styled.div`
  display: inline-flex;
  width: 20px;
  height: 25px;
  border-radius: 50%;
  text-align: center;
  font-size: 12px;
  margin-right: 10px;
  color: white;
  justify-content: center;
  align-items: center;
`;

const SpotItemDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 40px;
  width: 250px;
`;

const SpotTitle = styled.span`
  font-family: Inter;
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
`;
const SpotCategory = styled.span`
  font-family: Rounded Mplus 1c Bold;
  font-style: normal;
  color: #adadad;
  font-weight: 700;
  font-size: 10px;
  margin-left: 35px;
  margin-top: 3px;
`;

// box-shadow: inset 0px 0px 0px 10px #f00;
const SpotListItemDiv = styled.div`
  height: 41px;
  box-sizing: inherit;
`;
// @keyframes color {
//   0% {
//     border: ${(props) => `inset 0px 0px 0px 3px ${props.user_color}`};
//   }
//   33% {
//     border: ${(props) => `inset 0px 0px 0px 3px ${props.user_color}`};
//   }
//   66% {
//     border: ${(props) => `inset 0px 0px 0px 3px ${props.user_color}`};
//   }
//   100% {
//     border: 3px solid white;
//   }
// }

// animation: ${(props) => props.user_color && `color 1.5s linear`};
export default React.memo(SpotList);
