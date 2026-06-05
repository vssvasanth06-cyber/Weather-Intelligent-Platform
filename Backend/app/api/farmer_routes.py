from fastapi import APIRouter, Depends

from app.auth.role_checker import role_required

router = APIRouter(
    prefix="/farmer",
    tags=["Farmer"]
)


@router.get("/dashboard")
def farmer_dashboard(
    current_user=Depends(
        role_required("Farmer")
    )
):

    return {
        "message": "Welcome Farmer Dashboard",
        "user": current_user
    }