import { state, inputs, unitElements, results_desc_text, actionButtons } from "./ui.js"


//———————————————————————————————————————————————————————————————————————————————————————— //
//——————————————————————————————————— ON CHANGE RESULT ——————————————————————————————————— //
//———————————————————————————————————————————————————————————————————————————————————————— //
export function changeHasResult(newValue, d = null) {
    state.has_result = newValue;
    actionButtons.copy.toggleAttribute("disabled", !newValue);

    if (newValue && state.lastResult !== newValue) {
        const isNewResult = !state.lastResultsList.includes(d);
        if (isNewResult) {
            updateResultsList(d);
        }
    }
    state.lastResult = newValue;
}

function updateResultsList(d) {
    state.resultsCalculated++;
    localStorage.setItem('calcResult', state.resultsCalculated);
    state.lastResultsList.push(d);
    if (state.lastResultsList.length > 50) {
        state.lastResultsList.shift();
    }
    checkForSpecialEvent();
}

function checkForSpecialEvent() {
    const resultsInterval = state.resultsCalculated % 5 === 0 || state.resultsCalculated === 1;
    const timeInterval = Date.now() - state.lastTimeStarsViewed > 1000 * 60;
    if (resultsInterval && timeInterval && state.starsClicked === "false") {
        setTimeout(() => {
            location.href = "./thx_page.html";
            state.lastTimeStarsViewed = Date.now();
            localStorage.setItem("lastTimeStarsViewed", state.lastTimeStarsViewed.toString());
        }, 5000);
    }
}

function noFields() {
    changeHasResult(false);
    document.getElementById("result-box").innerHTML = `<div>
        <div class="result">Result:</div>
        <div class="please-fill-out">Please fill out required fields.</div>
    </div>`;
}

// Collecting form data
function collectFormData() {
    return {
        sex: state.sex,
        black_race: state.race == 'null' ? null : state.race,
        weight: parseFloat(inputs.weight.value) * (unitElements.weight.innerText === "kg" ? 1 : 0.45359237),
        height: parseFloat(inputs.height.value) * (unitElements.height.innerText === "cm" ? 1 : 2.54),
        creatinine: parseFloat(inputs.creatinine.value) * (unitElements.creatinine.innerText === "mg/dL" ? 1 : 1 / 88.4),
        cystatin: parseFloat(inputs.cystatin.value),
        age: parseFloat(inputs.age.value)
    };
}



//———————————————————————————————————————————————————————————————————————————————————————— //
//———————————————————————————————————————— GAULT ———————————————————————————————————————— //
//———————————————————————————————————————————————————————————————————————————————————————— //
function calculateGault(formdata) {

    let sexMultiplier = formdata.sex === "female" ? 0.85 : 1;
    let heightInches = formdata.height / 2.54;
    let ibw = formdata['sex'] === "male" ? 50 + (2.3 * (heightInches - 60)) : 45.5 + (2.3 * (heightInches - 60));
    let abw = ibw + 0.4 * (formdata['weight'] - ibw);
    let bmi = formdata['weight'] / (Math.pow(formdata['height'] / 100, 2));
    let useIbw = bmi >= 18.5 && bmi <= 24.9;
    let using = `using adjusted body weight of ${Math.round(abw)} kg (${Math.round(abw * 1 / 0.45)} lbs)`
    if (useIbw) {
        let tmp = abw;
        abw = ibw;
        ibw = tmp;
        using = `using idel body weight of ${Math.round(ibw)} kg (${Math.round(ibw * 1 / 0.45)} lbs)`
    }




    let crcl_actual_weight = ((140 - formdata['age']) * formdata.weight * sexMultiplier) / (72 * formdata['creatinine'])
    let crcl_ibw = ((140 - formdata['age']) * ibw * sexMultiplier) / (72 * formdata['creatinine'])
    let crcl_abw = ((140 - formdata['age']) * abw * sexMultiplier) / (72 * formdata['creatinine'])

    // console.log(bmi, crCl, formdata['age'], weightUsed, formdata['creatinine'], sexMultiplier)

    results_desc_text.innerHTML = `<div class="point"><h2>${Math.round(crcl_actual_weight)}<small class="ss">mL/min/1.73 m²</small></h2><div style="font-size: 10px;">Creatinine clearance, adjusted Cockcroft-Gault</div></div>`;
    let bmi_case = "";

    if (bmi >= 18.5) {
        results_desc_text.innerHTML += "<div class='seppep'></div>";
        results_desc_text.innerHTML += `<div class="point"><h2>${Math.round(crcl_abw)}<small class="ss">mL/min/1.73 m²</small></h2><div style="font-size: 10px;">Creatinine clearance modified for overweight patient, ${using}</div></div>`;
        results_desc_text.innerHTML += "<div class='seppep'></div>";

        results_desc_text.innerHTML += `<div class="point"><h2>${(crcl_ibw).toFixed(1)} — ${(crcl_abw).toFixed(1)}<small class="ss">mL/min/1.73 m²</small></h2><div style="font-size: 10px;">Note: This range uses IBW and adjusted body weight. Controversy exists over which form of weight to use.</div></div>`;

        bmi_case = `
${Math.round(crcl_abw)} mL/min/1.73 m²
Creatinine clearance modified for overweight patient, ${using}.

${(crcl_ibw).toFixed(1)} — ${(crcl_abw).toFixed(1)} mL/min/1.73 m²
Note: This range uses IBW and adjusted body weight. Controversy exists over which form of weight to use.`;
    }

    changeHasResult(state.resultMode, crcl_actual_weight);
    state.currentResult = `RESULT SUMMARY:
${Math.round(crcl_actual_weight)} mL/min/1.73 m²
Creatinine clearance, adjusted Cockcroft-Gault
${bmi_case}

INPUTS:
Sex —> ${formdata['sex']}
Age —> ${formdata['age']} years
Weight —> ${inputs.weight.value} ${unitElements.weight.innerText}
Serum creatinine —> ${inputs.creatinine.value} ${unitElements.creatinine.innerText}`;
if (inputs.height.value) {
    state.currentResult += `
Height —> ${inputs.height.value} ${unitElements.height.innerText}`
}
}


//———————————————————————————————————————————————————————————————————————————————————————— //
//———————————————————————————————————————— MDRD ———————————————————————————————————————— //
//———————————————————————————————————————————————————————————————————————————————————————— //
function calculateMDRD(formdata) {
    console.log(formdata)
    const creatinine = formdata.creatinine
    const age = parseInt(formdata.age, 10);
    const isFemale = formdata.sex === "female";
    const isBlack = formdata.black_race === "yes";

    const genderFactor = isFemale ? 0.742 : 1;
    
    let result1 = 175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203) * genderFactor * 1;
    let result2 = 175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203) * genderFactor * 1.212;

    let r;
    if (formdata['black_race'] === null) {
        r = result1.toFixed(1) + "-" + result2.toFixed(1);
    } else {
        r = (isBlack ? result2 : result1).toFixed(1);
    }
    results_desc_text.innerHTML = `<div class="point"><h2>${r}<small class="ss">mL/min/1.73 m²</small></h2><div>Glomerular Filtration Rate</div><div>by the MDRD Equation</div></div>`;
    changeHasResult(state.resultMode, result1);
    state.currentResult = `RESULT SUMMARY:
${r} mL/min/1.73 m²
Glomerular Filtration Rate by the MDRD Equation

INPUTS:
Sex —> ${formdata['sex']}
Black race —> ${formdata['black_race'] == null ? "?" : formdata['black_race']}
Age —> ${formdata['age']} years
Serum creatinine —> ${inputs.creatinine.value} ${unitElements.creatinine.innerText}`;
}


//———————————————————————————————————————————————————————————————————————————————————————— //
//———————————————————————————————————————— CKD ———————————————————————————————————————— //
//———————————————————————————————————————————————————————————————————————————————————————— //
function calculateCKD(formdata) {

    function determineCKDStage(eGFR) {
        if (eGFR >= 90) {
            return "Stage I";
        } else if (eGFR >= 60) {
            return "Stage II";
        } else if (eGFR >= 45) {
            return "Stage IIIa";
        } else if (eGFR >= 30) {
            return "Stage IIIb";
        } else if (eGFR >= 15) {
            return "Stage IV";
        } else {
            return "Stage V";
        }
    }

    let scr = formdata['creatinine'];
    let age = formdata['age'];
    let f = 1;
    let ckd = null;
    let mode = "";
    if (isNaN(formdata['cystatin'])) {
        // If without cystatin so only creatinine
        mode = "2021 CKD-EPI Creatinine";
        if (formdata['sex'] === "female") {
            f = 1.012;
        }
        let scrThreshold = formdata['sex'] === 'female' ? 0.7 : 0.9;
        let A = formdata['sex'] === 'female' ? 0.7 : 0.9;
        let B = 0;

        if (scr <= 0.7) {
            B = formdata['sex'] === 'female' ? -0.241 : -0.302;
        } else {
            B = -1.2;
        }
        ckd = 142 * Math.pow(scr / A, B) * Math.pow(0.9938, age) * f
        // 142 x (Scr/A)B x 0.9938age x (1.012 if female), where A and B are the following:
    } else {
        // Constants for the CKD-EPI Creatinine-Cystatin C 2021 equation
        mode = "2021 CKD-EPI Creatinine-Cystatin C";
        let scrThreshold = formdata['sex'] === 'female' ? 0.7 : 0.9;
        let A = 0;
        let age = formdata['age'];
        let scys = formdata['cystatin'];
        let scr = formdata['creatinine'];
        let f = 1;
        if (formdata['sex'] === "female") {
            f = 0.963;
            A = 0.7;
        } else {
            A = 0.9;
        }
        scrThreshold = A;
        let C = 0.8;
        let B = 0;
        let D = 0;

        if (scr <= scrThreshold) {
            if (scys <= 0.8) {
                B = -0.144;
                D = -0.323;
                console.log('a')
            } else {
                B = -0.144;
                D = -0.778;
                console.log('b')
            }
        } else {
            B = -0.544;
            if (scys <= 0.8) {
                D = -0.323;
                console.log('c')
            } else {
                D = -0.778;
                console.log('d')
            }
        }

        ckd = 135 * Math.pow((scr / A), B) * Math.pow((scys / C), D) * Math.pow(0.9961, age) * f;

    }
    // Output the results
    results_desc_text.innerHTML = `<div class="point"><h2>${Math.round(ckd)}<small class="ss">mL/min/1.73 m²</small></h2><div>Estimated GFR</div><div>${mode}</div></div>`;
    results_desc_text.innerHTML += "<div class='seppep'></div>";
    results_desc_text.innerHTML += `<div class="point"><h2>${determineCKDStage(ckd)}</h2><div>CKD stage by CKD-EPI Creatinine</div></div>`;
    changeHasResult(state.resultMode, ckd);
    state.currentResult = `RESULT SUMMARY:
${Math.round(ckd)} mL/min/1.73 m²
Estimated GFR by ${mode}

${determineCKDStage(ckd)} CKD stage by CKD-EPI Creatinine


INPUTS:
Sex —> ${formdata['sex']}
Age —> ${age}
Serum creatinine —> ${inputs.creatinine.value} ${unitElements.creatinine.innerText}`
if (formdata['cystatin']) {
    state.currentResult += `
Serum cystatin C —> ${formdata['cystatin']} mg/L`;
};

}
//———————————————————————————————————————————————————————————————————————————————————————— //
//————————————————————————————————————————  BASE  ———————————————————————————————————————— //
//———————————————————————————————————————————————————————————————————————————————————————— //

export function calcCreatineClearence() {
    const formdata = collectFormData();

    let baseCondition = (formdata['sex'] != null) && !isNaN(formdata['age']) && !isNaN(formdata['creatinine']);
    console.log(baseCondition)
    switch (state.resultMode) {
        case 'gault':
            if (baseCondition && !isNaN(formdata['weight'])) {
                calculateGault(formdata);

            } else {
                noFields();
            }
            break;
        case 'mdrd':
            if (baseCondition) {
                calculateMDRD(formdata);

            } else {
                noFields();
            }
            break;
        case 'ckd':
            if (baseCondition) {
                calculateCKD(formdata);

            } else {
                noFields();
            }
            break;
    }
}