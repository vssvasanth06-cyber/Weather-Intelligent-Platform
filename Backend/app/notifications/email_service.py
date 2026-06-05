"""
Email Alert Service — uses Gmail SMTP (free)
Set these in your .env:
  ALERT_EMAIL_FROM=your_gmail@gmail.com
  ALERT_EMAIL_PASSWORD=your_app_password   (Gmail App Password)
  ALERT_EMAIL_TO=recipient@email.com
"""
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime


SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_FROM = os.getenv("ALERT_EMAIL_FROM", "")
EMAIL_PASSWORD = os.getenv("ALERT_EMAIL_PASSWORD", "")
EMAIL_TO = os.getenv("ALERT_EMAIL_TO", "")


def send_alert_email(subject: str, alert_type: str, message: str, value: str, device_id: str) -> bool:
    if not all([EMAIL_FROM, EMAIL_PASSWORD, EMAIL_TO]):
        print("[Email] Email credentials not configured — skipping")
        return False

    try:
        html = f"""
        <html><body style="font-family: Arial; background: #0f172a; color: #fff; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #1e293b; border-radius: 12px; padding: 24px;">
            <h2 style="color: #f97316;">🚨 Weather Alert — {alert_type}</h2>
            <p style="color: #94a3b8;">Device: <strong style="color:#fff">{device_id}</strong></p>
            <p style="color: #94a3b8;">Time: <strong style="color:#fff">{datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</strong></p>
            <div style="background:#7f1d1d;border-radius:8px;padding:16px;margin:16px 0;">
                <p style="margin:0;font-size:18px;"><strong>{message}</strong></p>
                <p style="margin:4px 0 0;color:#fca5a5;">Value: {value}</p>
            </div>
            <p style="color:#64748b;font-size:12px;">Weather Intelligence Platform — Automated Alert</p>
        </div>
        </body></html>
        """

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"⚠️ {subject}"
        msg["From"] = EMAIL_FROM
        msg["To"] = EMAIL_TO
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.sendmail(EMAIL_FROM, EMAIL_TO, msg.as_string())

        print(f"[Email] Alert sent: {subject}")
        return True

    except Exception as e:
        print(f"[Email] Failed to send: {e}")
        return False


def check_and_send_alerts(reading) -> list:
    alerts_sent = []

    if reading.temperature and reading.temperature > 40:
        send_alert_email(
            subject="Extreme Heat Alert",
            alert_type="EXTREME_HEAT",
            message="Extreme heat detected — immediate action required",
            value=f"{reading.temperature}°C",
            device_id=reading.device_id
        )
        alerts_sent.append("EXTREME_HEAT")

    if reading.rainfall and reading.rainfall > 0.8:
        send_alert_email(
            subject="Heavy Rain Alert",
            alert_type="HEAVY_RAIN",
            message="Heavy rainfall detected",
            value=f"{reading.rainfall}mm",
            device_id=reading.device_id
        )
        alerts_sent.append("HEAVY_RAIN")

    if reading.wind_speed and reading.wind_speed > 10:
        send_alert_email(
            subject="High Wind Alert",
            alert_type="HIGH_WIND",
            message="Dangerous wind speed detected",
            value=f"{reading.wind_speed}m/s",
            device_id=reading.device_id
        )
        alerts_sent.append("HIGH_WIND")

    return alerts_sent
