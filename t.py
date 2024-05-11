scr = 0.2
scysc = 1
age = 30
A = 0.9
B = -0.144
C = 0.8
D = -0.778
age_factor = 0.9961

# Recalculate eGFR for a male using the detailed formula
egfr_detailed = 135 * ((scr / A) ** B) * ((scysc / C) ** D) * (age_factor ** age)
print(egfr_detailed)