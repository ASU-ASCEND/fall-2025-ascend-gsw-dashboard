# ASCEND Ground Software

### Setup Instructions

1. Clone the repository
2. Setup `bun` runtime : https://bun.sh/
3. Run `bun install` to install dependencies
4. Run `bun dev` to start the development server
5. Open `http://localhost:3000` in your browser to view the application

### Categorizing Telemetry

SYS (System Operations): millis, pcf8523_year, pcf8523_month, pcf8523_day, pcf8523_hour, pcf8523_minute, pcf8523_second, ina260_current_ma, ina260_voltage_mv, ina260_power_mw, picotemp_temp_c

ADCO (Attitude Determination and Control): icm20948_accx_g, icm20948_accy_g, icm20948_accz_g, icm20948_gyrox_deg_s, icm20948_gyroy_deg_s, icm20948_gyroz_deg_s, icm20948_magx_ut, icm20948_magy_ut, icm20948_magz_ut, icm20948_temp_c

FIDO (Flight Dynamics): mtk3339_year, mtk3339_month, mtk3339_day, mtk3339_hour, mtk3339_minute, mtk3339_second, mtk3339_latitude, mtk3339_longitude, mtk3339_speed, mtk3339_heading, mtk3339_altitude, mtk3339_satellites, bmp390_temp_c, bmp390_pressure_pa, bmp390_altitude_m

ECLSS (Environmental Control and Life Support): tmp117_temp_c, shtc3_temp_c, shtc3_rel_hum, scd40_co2_conc_ppm, scd40_temp_c, scd40_rel_hum, ens160_aqi, ens160_tvoc_ppb, ens160_eco2_ppm

MET (Meteorology): tmp117_o_temp_o_c, shtc3_o_temp_o_c, shtc3_o_rel_hum_o, scd40_o_co2_conc_o_ppm, scd40_o_temp_o_c, scd40_o_rel_hum_o, ens160_o_aqi_o, ens160_o_tvoc_o_ppb, ens160_o_eco2_o_ppm, ozone_conc_ppb, uv_sensor_uva2_nm, uv_sensor_uvb2_nm, uv_sensor_uvc2_nm
