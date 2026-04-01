"""
Smart Inventory Forecasting Engine — v1.0.0
Predicts asset depletion and recommends procurement actions.
"""

import math
from datetime import datetime, timedelta
from typing import List, Dict
from app.models import (
    InventoryForecastRequest,
    InventoryForecastResponse,
    InventoryForecast,
    InventoryItemProfile,
    StockUsageHistory
)

def calculate_inventory_forecast(req: InventoryForecastRequest) -> InventoryForecastResponse:
    """
    Forecasting logic: 
    1. Calculate daily average usage rate from history.
    2. Estimate 'Days to Zero' based on current stock.
    3. Generate risk levels and procurement quantities.
    """
    forecasts = []
    
    # Group history by itemId
    usage_map: Dict[str, List[float]] = {}
    for entry in req.usageHistory:
        if entry.type == "OUT":
            usage_map.setdefault(entry.itemId, []).append(entry.quantity)

    now = datetime.now()

    for item in req.items:
        # Calculate avg daily usage (fallback to 1.0 unit/day if no history)
        item_history = usage_map.get(item.id, [])
        avg_usage = sum(item_history) / max(len(item_history), 1) if item_history else 0.5
        
        # If no usage and stock is positive, assume very slow depletion
        if avg_usage == 0:
            avg_usage = 0.1

        days_remaining = int(item.currentStock / avg_usage)
        depletion_date = now + timedelta(days=days_remaining)
        
        # Determine risk level
        risk = "LOW"
        if days_remaining <= req.leadTimeDays:
            risk = "CRITICAL"
        elif days_remaining <= (req.leadTimeDays + 3):
            risk = "HIGH"
        elif item.currentStock <= item.minThreshold:
            risk = "MEDIUM"

        # Recommended order quantity (Buffer 30 days of usage + min threshold)
        rec_qty = (avg_usage * 30) + item.minThreshold
        
        forecasts.append(InventoryForecast(
            itemId=item.id,
            itemName=item.name,
            daysUntilDepletion=days_remaining,
            depletionDate=depletion_date.isoformat(),
            recommendedOrderQty=round(rec_qty, 2),
            riskLevel=risk,
            reasoning=f"Based on average daily usage of {avg_usage} {item.unit}/day. "
                      f"Stock will fall below min threshold in {max(0, days_remaining - 5)} days."
        ))

    # Summary
    critical_count = sum(1 for f in forecasts if f.riskLevel == "CRITICAL")
    summary = f"Detected {critical_count} critical inventory shortages requiring immediate procurement." if critical_count > 0 else "All inventory levels optimized."

    return InventoryForecastResponse(
        status="SUCCESS",
        forecasts=forecasts,
        criticalSummary=summary
    )
