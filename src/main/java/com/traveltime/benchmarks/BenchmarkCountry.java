package com.traveltime.benchmarks;

import com.traveltime.sdk.dto.requests.proto.Country;

public enum BenchmarkCountry implements Country {
    LATVIA("lv"),
    NETHERLANDS("nl"),
    AUSTRIA("at"),
    BELGIUM("be"),
    GERMANY("de"),
    FRANCE("fr"),
    IRELAND("ie"),
    LITHUANIA("lt"),
    UNITED_KINGDOM("uk"),
    US_AKST("usa"),
    US_CSTN("usa"),
    US_CSTS("usa"),
    US_ESTN("usa"),
    US_ESTS("usa"),
    US_HI("usa"),
    US_MST("usa"),
    US_PST("usa");

    private final String value;

    public String getValue() {
        return this.value;
    }

    private BenchmarkCountry(String value) {
        this.value = value;
    }
}