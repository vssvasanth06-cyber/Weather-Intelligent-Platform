from fastapi import APIRouter, Depends

from app.auth.role_checker import role_required

router = APIRouter(
    prefix="/analyst",
    tags=["Analyst"]
)


@router.get("/dashboard")
def analyst_dashboard(
    current_user=Depends(
        role_required("Analyst")
    )
):

    return {
        "message": "Welcome Analyst Dashboard",
        "user": current_user
    }