from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.ws_manager import manager

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/live")
async def websocket_live(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; data flows server→client via broadcast
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
