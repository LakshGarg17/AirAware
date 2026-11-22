import pytest
from app.utils.aqi import get_aqi_interpretation, AQI_THRESHOLDS


def test_aqi_good_boundary():
    # 0 to 50
    res0 = get_aqi_interpretation(0)
    assert res0["category"] == "Good"
    assert res0["severity_key"] == "good"
    assert res0["color_token"] == "green"
    assert res0["standard"] == "US AQI"
    assert res0["aqi"] == 0

    res50 = get_aqi_interpretation(50)
    assert res50["category"] == "Good"
    assert res50["severity_key"] == "good"


def test_aqi_moderate_boundary():
    # 51 to 100
    res51 = get_aqi_interpretation(51)
    assert res51["category"] == "Moderate"
    assert res51["severity_key"] == "moderate"
    assert res51["color_token"] == "yellow"

    res100 = get_aqi_interpretation(100)
    assert res100["category"] == "Moderate"
    assert res100["severity_key"] == "moderate"


def test_aqi_sensitive_unhealthy_boundary():
    # 101 to 150
    res101 = get_aqi_interpretation(101)
    assert res101["category"] == "Unhealthy for Sensitive Groups"
    assert res101["severity_key"] == "sensitive_unhealthy"
    assert res101["color_token"] == "orange"

    res150 = get_aqi_interpretation(150)
    assert res150["category"] == "Unhealthy for Sensitive Groups"


def test_aqi_unhealthy_boundary():
    # 151 to 200
    res151 = get_aqi_interpretation(151)
    assert res151["category"] == "Unhealthy"
    assert res151["severity_key"] == "unhealthy"
    assert res151["color_token"] == "red"

    res200 = get_aqi_interpretation(200)
    assert res200["category"] == "Unhealthy"


def test_aqi_very_unhealthy_boundary():
    # 201 to 300
    res201 = get_aqi_interpretation(201)
    assert res201["category"] == "Very Unhealthy"
    assert res201["severity_key"] == "very_unhealthy"
    assert res201["color_token"] == "purple"

    res300 = get_aqi_interpretation(300)
    assert res300["category"] == "Very Unhealthy"


def test_aqi_hazardous_boundary():
    # 301+
    res301 = get_aqi_interpretation(301)
    assert res301["category"] == "Hazardous"
    assert res301["severity_key"] == "hazardous"
    assert res301["color_token"] == "maroon"

    res500 = get_aqi_interpretation(500)
    assert res500["category"] == "Hazardous"
    assert res500["severity_key"] == "hazardous"


def test_aqi_invalid_and_null_inputs():
    res_none = get_aqi_interpretation(None)
    assert res_none["category"] == "Unavailable"
    assert res_none["severity_key"] == "unavailable"
    assert res_none["color_token"] == "gray"
    assert res_none["aqi"] is None

    res_neg = get_aqi_interpretation(-15)
    assert res_neg["category"] == "Unavailable"
    assert res_neg["severity_key"] == "unavailable"

    res_str_invalid = get_aqi_interpretation("invalid_string")
    assert res_str_invalid["category"] == "Unavailable"

    res_float = get_aqi_interpretation(75.6)
    assert res_float["category"] == "Moderate"
    assert res_float["aqi"] == 76
