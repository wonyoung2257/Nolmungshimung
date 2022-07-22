import React, { useEffect, useState, useContext } from "react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";
import { QuillBinding } from "y-quill";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import ReactQuill from "react-quill";
import styled from "styled-components";
import { ConnectuserContext } from "../../context/ConnectUserContext";

const TOOLBAR_OPTIONS = [
  [{ align: [] }],
  [{ header: [1, 2, 3, false] }],
  [{ font: [] }],
  ["bold", "underline", { color: [] }, { background: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "+1" }, { indent: "-1" }],
  ["link", "blockquote"],
];

const MemoRtc = ({ project_Id }) => {
  let quillRef = null;
  let reactQuillRef = null;
  const [projectID, setProjectId] = useState(project_Id);
  const { connectUser, setConnectUser } = useContext(ConnectuserContext);
  const userName = sessionStorage.getItem("myNickname");

  Quill.register("modules/cursors", QuillCursors);
  useEffect(() => {
    setProjectId(project_Id);
  }, [project_Id]);

  useEffect(() => {
    attachQuillRefs();

    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(`${projectID}`, ydoc);
    const indexeddbProvider = new IndexeddbPersistence(`${projectID}`, ydoc);
    const ytext = ydoc.getText(`${projectID}`);
    try {
      provider.awareness.setLocalStateField("user", {
        name: userName,
        color: connectUser[userName].color,
      });
    } catch (err) {
      return () => {
        provider.destroy();
      };
    }
    const binding = new QuillBinding(ytext, quillRef, provider.awareness);

    return () => {
      provider.destroy();
    };
  }, []);

  const attachQuillRefs = () => {
    if (typeof reactQuillRef.getEditor !== "function") return;
    quillRef = reactQuillRef.getEditor();
  };

  const modulesRef = {
    toolbar: TOOLBAR_OPTIONS,
    cursors: {
      transformOnTextChange: true,
      toggleFlag: true,
    },
    history: {
      // Local undo shouldn't undo changes
      // from remote users
      userOnly: true,
    },
  };

  return (
    <StyledEditorBox>
      <EditorContainer>
        <ReactQuill
          ref={(el) => {
            reactQuillRef = el;
          }}
          modules={modulesRef}
          theme={"snow"}
        />
      </EditorContainer>
    </StyledEditorBox>
  );
};

const StyledEditorBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 47%;
  /* background-color: red; */

  width: 58vw;
`;

const EditorContainer = styled.div`
  /* background-color: blue; */
  width: 100%;
  height: 100%;
  .quill {
    height: 84%;
  }
  div#container {
    height: 35vh;
    width: 61vw;
    padding: 1%;
  }
  .ql-toolbar.ql-snow {
    border-radius: 5px 5px 0px 0px;
  }
  .ql-container.ql-snow {
    border-radius: 0 0 5px 5px;
    /* height: 195px; */
  }
  .ql-editor strong {
    font-weight: bold;
  }
`;

export default MemoRtc;
