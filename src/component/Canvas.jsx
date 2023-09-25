import { useState, useEffect, useRef } from "react";

const DrawingBoard = () => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [paths, setPaths] = useState([]); // 여러 그림을 그릴 수 있도록 paths 배열로 변경
  const [decodedPaths, setDecodedPaths] = useState([]);
  const [lastPoint, setLastPoint] = useState(null); // 이전 좌표 저장

  const startDrawing = (e) => {
    setDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    setPaths((prevPaths) => [...prevPaths, [{ x: offsetX, y: offsetY }]]); // 새로운 그림의 path 시작
    setLastPoint({ x: offsetX, y: offsetY });
  };

  const continueDrawing = (e) => {
    if (!drawing) return;

    const { offsetX, offsetY } = e.nativeEvent;

    if (
      Math.abs(offsetX - lastPoint.x) >= 5 ||
      Math.abs(offsetY - lastPoint.y) >= 5
    ) {
      setPaths((prevPaths) => {
        const currentPath = prevPaths[prevPaths.length - 1];
        return [
          ...prevPaths.slice(0, -1),
          [...currentPath, { x: offsetX, y: offsetY }],
        ]; // 현재 그림의 path에 점 추가
      });
      setLastPoint({ x: offsetX, y: offsetY }); // 이전 좌표 업데이트
    }
    draw();
  };

  const endDrawing = () => {
    setDrawing(false);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    paths.forEach((path) => {
      ctx.beginPath();
      path.forEach(({ x, y }, index) => {
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.closePath();
    });
  };

  const serializePaths = () => {
    const serialized = JSON.stringify(paths);
    const base64Serialized = btoa(serialized);
    return base64Serialized;
  };
  const savePathsToURL = () => {
    const serialized = serializePaths();

    const url = `${window.location.origin}?paths=${encodeURIComponent(
      serialized
    )}`;
    window.history.pushState({ paths: url }, "", url);
    copyCurrentURLToClipboard();
  };

  const handleResetCanvas = () => {
    setPaths([]);
    setDecodedPaths([]);
    draw();
    window.history.pushState({ paths: null }, "", window.location.origin);
    window.location.reload();
  };

  const copyCurrentURLToClipboard = () => {
    const currentURL = window.location.href; // 현재 페이지의 URL 가져오기

    // 임시로 input 엘리먼트를 생성하고 값을 복사합니다.
    const tempInput = document.createElement("input");
    tempInput.value = currentURL;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    alert("현재 URL이 클립보드에 복사되었습니다.");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedPath = params.get("paths");

    if (encodedPath) {
      const decodedPath = atob(encodedPath);
      const pathData = JSON.parse(decodedPath);

      setDecodedPaths(pathData);
      setPaths(pathData);
    }
  }, []);

  useEffect(() => {
    if (decodedPaths.length > 0) {
      setPaths(decodedPaths);
      draw();
    }
  }, [decodedPaths]);

  return (
    <div className="container">
      <h1>Draw and share</h1>
      <div className="canvas_wrapper">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={continueDrawing}
          onMouseUp={endDrawing}
          width={300}
          height={300}
          className="canvas"
        />
      </div>
      <div className="button_wrapper">
        <button className="button share" onClick={savePathsToURL}>
          Share
        </button>
        <button className="button clear" onClick={handleResetCanvas}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default DrawingBoard;
