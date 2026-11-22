import pytest
from app.utils.weather import get_weather_condition


def test_weather_clear_sky():
    day_res = get_weather_condition(0, is_day=1)
    assert day_res["label"] == "Clear Sky"
    assert day_res["icon"] == "sun"
    assert day_res["condition"] == "clear"

    night_res = get_weather_condition(0, is_day=0)
    assert night_res["label"] == "Clear Sky"
    assert night_res["icon"] == "moon"


def test_weather_fog():
    res = get_weather_condition(45, is_day=1)
    assert res["label"] == "Fog"
    assert res["icon"] == "cloud-fog"


def test_weather_rain_and_thunderstorm():
    rain = get_weather_condition(63, is_day=1)
    assert rain["label"] == "Moderate Rain"
    assert rain["icon"] == "cloud-rain"

    thunder = get_weather_condition(95, is_day=1)
    assert thunder["label"] == "Thunderstorm"
    assert thunder["icon"] == "cloud-lightning"


def test_weather_null_and_unknown():
    res_none = get_weather_condition(None)
    assert res_none["label"] == "Unavailable"
    assert res_none["condition"] == "unavailable"

    res_unknown = get_weather_condition(999)
    assert "999" in res_unknown["label"]
