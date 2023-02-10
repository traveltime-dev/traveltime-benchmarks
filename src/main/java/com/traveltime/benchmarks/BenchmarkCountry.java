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
    US_AKST("us_akst"),
    US_CSTN("us_cstn"),
    US_CSTS("us_csts"),
    US_ESTN("us_estn"),
    US_ESTS("us_ests"),
    US_HI("us_hi"),
    US_MST("us_mst"),
    US_PST("us_pst");

    private final String value;

    public String getValue() {
        return this.value;
    }

    private BenchmarkCountry(String value) {
        this.value = value;
    }
}