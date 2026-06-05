from fastapi import APIRouter, Depends

from app.auth.role_checker import role_required

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/dashboard")
def admin_dashboard(
    current_user=Depends(
        role_required("Admin")
    )
):

    return {
        "message": "Welcome Admin Dashboard",
        "user": current_user
    }