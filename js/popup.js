let weight_units = "kg";
let height_units = "cm";
let creatine_units = "mg/dL";
let sex = null;
let black_race = null;
let result_mode = "gault";
let has_result = false;
let results_calculated = localStorage.getItem('calcResult') == null ? 0 : parseInt(localStorage.getItem('calcResult'));
let stars_clicked = localStorage.getItem('stars_clicked') == null ? "false" : localStorage.getItem('stars_clicked');
let review_results_count = 99999999999999;
let lastResult = null;
let lastResultsList = [];

let lastTimeStarsViewed = localStorage.getItem('lastTimeStarsViewed') == null ? 0 : parseInt(localStorage.getItem('lastTimeStarsViewed'));
// results_calculated = 0;
// stars_clicked = "false";
console.log(results_calculated, stars_clicked,)
let currentResult = null;


let age_input = document.getElementById("age_input");

let weight_units_btn = document.getElementById("weight_units");
let weight_input = document.getElementById("weight_input");

let height_units_btn = document.getElementById("height_units");
let height_input = document.getElementById("height_input");

let serum_cystatin_units_btn = document.getElementById("serum_cystatin_units");
let serum_cystatin_input = document.getElementById("serum_cystatin_input");

let serum_creatinine_units_btn = document.getElementById("serum_creatinine_units");
let serum_creatinine_input = document.getElementById("serum_creatinine_input");

let radio_group_sex = document.getElementById("radio_group_sex");
let radio_group_black_race = document.getElementById("radio_group-black_race");

let radio_sex_female = document.getElementById("radio_female");
let radio_sex_male = document.getElementById("radio_male");
let sex_separator = document.getElementById("sex_separator")

let black_race_separator = document.getElementById("black_race_separator")
let radio_yes = document.getElementById("radio_yes");
let radio_no = document.getElementById("radio_no");

let results_desc_text = document.getElementById("result-box");

let radio_mode_gault = document.getElementById("radio_mode_gault");
let radio_mode_mdrd = document.getElementById("radio_mode_mdrd");
let radio_mode_ckd = document.getElementById("radio_mode_ckd");

let clear_results = document.getElementById("clear_results_btn");
let copy_results = document.getElementById("copy_results_btn");
$("input[type='number']").on("input change", function () {
    var $this = $(this);
    var value = parseInt($this.val(), 10); // Получение текущего значения поля и преобразование в число
    var min = parseFloat($this.attr("min"), 10);
    var max = parseFloat($this.attr("max"), 10);

    // Корректировка значения, если оно выходит за установленные ограничения
    // if (value > max) {
    //     $this.val(max); // Установка значения равным максимальному, если оно его превышает
    // } else if (value < min) {
    //     $this.val(min); // Установка значения равным минимальному, если оно его ниже
    // }

    // Динамическое обновление минимального и максимального значений
    var $errorMessage = $this.next('.error-message');
    if (min > value || max < value) {
        $this.addClass("error");
        $errorMessage.style.display = "block"; // Скрываем
    } else {
        $this.removeClass("error");
        $errorMessage.style.display = "none"; // Скрываем
    }
    console.log(value, $this.attr("min"), max);
});

clear_results.addEventListener('click', function () {
    $(".highlight").removeClass("highlight");
    age_input.value = "";
    weight_input.value = "";
    height_input.value = "";
    serum_cystatin_input.value = "";
    serum_creatinine_input.value = "";
    radio_sex_female.classList.remove('segmented-unit-checked');
    radio_group_sex.value = null;
    radio_group_black_race.value = null;
    radio_sex_male.classList.remove('segmented-unit-checked');
    radio_yes.classList.remove('segmented-unit-checked');
    radio_no.classList.remove('segmented-unit-checked');
    changeHasResult(false);
    document.getElementById("result-box").innerHTML = `<div>
        <div class="result">Result:</div>
        <div class="please-fill-out">Please fill out required fields.</div>
    </div>`;
    saveToLocalStorage();
});

copy_results.addEventListener('click', function () {

    navigator.clipboard.writeText(currentResult).then(function () {
        console.log('Copying to clipboard was successful!');
    }, function (err) {
        console.error('Could not copy text: ', err);
    });
    if (stars_clicked === "false") {
        console.log(results_calculated, "Fuck")
        lastTimeStarsViewed = Date.now();
        localStorage.setItem("lastTimeStarsViewed", lastTimeStarsViewed.toString());
        location.href = "./thx_page.html";
    }
});

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
        return "Stage IV";
    }
}

function changeHasResult(newValue, d = null) {

    has_result = newValue;
    if (has_result) {
        copy_results.removeAttribute("disabled");
    } else {
        copy_results.setAttribute("disabled", "disabled");
    }

    if (has_result) {
        if (lastResult != newValue) {
            if (lastResultsList.find((el) => el == d) == undefined) {
                results_calculated++;
                console.log(Date.now() - lastTimeStarsViewed)
                if ((results_calculated % 5 == 0 || results_calculated == 1) && Date.now() - lastTimeStarsViewed > 1000 * 60) {
                    setTimeout(() => {
                        if (stars_clicked === "false") {
                            location.href = "./thx_page.html";
                            lastTimeStarsViewed = Date.now();
                            localStorage.setItem("lastTimeStarsViewed", lastTimeStarsViewed.toString());
                        }
                    }, 5000)
                }
                console.log(results_calculated)
                localStorage.setItem('calcResult', results_calculated);
                lastResultsList.push(d);
                if (lastResultsList.length > 50) {
                    lastResultsList.pop(0);
                }
            }
        }
        lastResult = newValue;
    }

}

function noFields() {
    changeHasResult(false);
    document.getElementById("result-box").innerHTML = `<div>
        <div class="result">Result:</div>
        <div class="please-fill-out">Please fill out required fields.</div>
    </div>`;
}

function calcCreatineClearence() {
    changeHasResult(false);
    let weight_units_mult = weight_units == "kg" ? 1 : 0.45359237;
    let creatine_units_mult = creatine_units == "mg/dL" ? 1 : 1 / 88.4;
    let height_units_mult = height_units == "cm" ? 1 : 2.54;
    let formdata = {
        "sex": sex,
        "black_race": black_race,
        "weight": parseFloat(weight_input.value) * weight_units_mult,
        "height": parseFloat(height_input.value) * height_units_mult,
        "creatinine": parseFloat(serum_creatinine_input.value) * creatine_units_mult,
        "cystatin": parseFloat(serum_cystatin_input.value),
        "age": parseFloat(age_input.value)

    }


    // console.log(formdata['sex'], !isNaN(formdata['sex']), !isNaN(formdata['weight']), !isNaN(formdata['creatinine']), !isNaN(formdata['age']));
    if (result_mode == "gault") {
        if (formdata['sex'] != null && !isNaN(formdata['weight']) && !isNaN(formdata['creatinine']) && !isNaN(formdata['age'])) {
            let sexMultiplier = formdata['sex'] === "female" ? 0.85 : 1;
            let heightInches = formdata['height'] / 2.54; // assuming height is provided in centimeters

            // Ideal Body Weight
            let ibw = formdata['sex'] === "male" ? 50 + (2.3 * (heightInches - 60)) : 45.5 + (2.3 * (heightInches - 60));

            // Adjusted Body Weight
            let abw = ibw + 0.4 * (formdata['weight'] - ibw);

            // Select the weight to use in Cockcroft-Gault formula based on BMI
            let bmi = formdata['weight'] / (Math.pow(formdata['height'] / 100, 2)); // height converted from cm to meters
            let weightUsed = formdata['weight'];
            if (bmi >= 18.5 && bmi <= 24.9) {
                weightUsed = ibw;
            }

            let crCl = (140 - formdata['age']) * weightUsed * sexMultiplier / (72 * formdata['creatinine']);
            // console.log(`CrCl: ${crCl} mL/min, IBW: ${ibw} kg, ABW: ${abw} kg`);
            results_desc_text.innerHTML = `<div class="point"><h2>${Math.round(crCl)}<small class="ss">mL/min</small></h2><div style="font-size: 12px;">Creatinine clearance, adjusted Cockcroft-Gault</div></div>`;
            let bmi_case = "";

            if (bmi >= 25) {
                let crCl2 = (140 - formdata['age']) * abw * sexMultiplier / (72 * formdata['creatinine']);
                // console.log(2, crCl);
                results_desc_text.innerHTML += "<div class='seppep'></div>";
                results_desc_text.innerHTML += `<div class="point"><h2>${Math.round(crCl2)}<small class="ss">mL/min</small></h2><div style="font-size: 12px;">Creatinine clearance modified for overweight patient, using adjusted body weight of ${Math.round(abw)} kg (${Math.round(abw * 2.54)} lbs).</div></div>`;
                results_desc_text.innerHTML += "<div class='seppep'></div>";

                let crCl3 = (140 - formdata['age']) * ibw * sexMultiplier / (72 * formdata['creatinine']);
                let crCl4 = (140 - formdata['age']) * abw * sexMultiplier / (72 * formdata['creatinine']);
                results_desc_text.innerHTML += `<div class="point"><h2>${(crCl3).toFixed(1)} — ${(crCl4).toFixed(1)}<small class="ss">mL/min</small></h2><div style="font-size: 12px;">Note: This range uses IBW and adjusted body weight. Controversy exists over which form of weight to use.</div></div>`;

                bmi_case = `
${Math.round(crCl)} mL/min
Creatinine clearance modified for overweight patient, using adjusted body weight of ${Math.round(abw)} kg (${Math.round(abw * 2.54)} lbs).

${(crCl3).toFixed(1)} — ${(crCl4).toFixed(1)} mL/min
Note: This range uses IBW and adjusted body weight. Controversy exists over which form of weight to use.`;
            }
            changeHasResult(result_mode, crCl);
            currentResult = `RESULT SUMMARY:
${Math.round(crCl)} mL/min
Creatinine clearance, adjusted Cockcroft-Gault
${bmi_case}

INPUTS:
Sex —> ${sex}
Age —> ${formdata['age']} years
Weight —> ${formdata['weight']} ${weight_units}
Height —> ${formdata['height'] != NaN ? formdata['height'] : '?'} ${height_units}
Serum creatinine —> ${formdata['creatinine']} ${creatine_units}`;

        } else {
            noFields();
            lastResult = null;
        }
    }
    if (result_mode == "mdrd") {

        if (formdata['sex'] != null && !isNaN(formdata['creatinine']) && !isNaN(formdata['age'])) {
            let f = 1;
            let b = 1;
            let v1 = null;
            let r = null;
            if (formdata['sex'] == "female") {
                f = 0.742;
            }
            if (formdata['black_race'] == null) {
                let b1 = 1;
                let b2 = 1.21;
                v1 = 175 * Math.pow(formdata['creatinine'], -1.154) * Math.pow(formdata['age'], -0.203) * f * b1
                let v2 = 175 * Math.pow(formdata['creatinine'], -1.154) * Math.pow(formdata['age'], -0.203) * f * b2
                r = v1.toFixed(1).toString() + `-` + v2.toFixed(1).toString();
                results_desc_text.innerHTML = `<div class="point"><h2>` + r + `<small class="ss">mL/min/1.73 m²</small></h2><div>Glomerular Filtration Rate</div><div>by the MDRD Equation</div></div>`;
            } else {
                if (formdata['black_race'] == "yes") {
                    b = 1.21;
                } else if (formdata['black_race'] == "no") {
                    b = 1;
                }
                v1 = 175 * Math.pow(formdata['creatinine'], -1.154) * Math.pow(formdata['age'], -0.203) * f * b
                r = v1.toFixed(1).toString();
                results_desc_text.innerHTML = `<div class="point"><h2>` + v1.toFixed(1) + `<small class="ss">mL/min/1.73 m²</small></h2><div>Glomerular Filtration Rate</div><div>by the MDRD Equation</div></div>`;
            }
            changeHasResult(result_mode, v1);
            currentResult = `RESULT SUMMARY:
${r} mL/min/1.73 m²
Glomerular Filtration Rate by the MDRD Equation

INPUTS:
Sex —> ${sex}
Black race —> ${formdata['black_race'] == null ? "?" : formdata['black_race']}
Age —> ${formdata['age']} years
Serum creatinine —> ${formdata['creatinine']} ${creatine_units}`;

        } else {
            noFields();
            lastResult = null;
        }
    }
    if (result_mode == "ckd") {
        // 2021 CKD-EPI Creatinine-Cystatin C 
        if (formdata['sex'] != null && !isNaN(formdata['creatinine']) && !isNaN(formdata['cystatin']) && !isNaN(formdata['age'])) {
            // Constants for the CKD-EPI Creatinine-Cystatin C 2021 equation
            let scr = formdata['creatinine'];
            let scys = formdata['cystatin'];
            let f = 1;
            if (formdata['sex'] === "female") {
                f = 0.963;
            }

            let scrThreshold = sex === 'female' ? 0.7 : 0.9;
            let A = sex === 'female' ? 0.7 : 0.9;
            let C = 0.8;
            let B = 0;
            let D = 0;

            if (scys <= 0.8) {
                B = scr <= scrThreshold ? -0.219 : -0.544;
                D = -0.323;
            } else {
                B = scr <= scrThreshold ? -0.219 : -0.544;
                D = -0.778;
            }

            g = 135 * Math.pow((scr / A), B) * Math.pow((scys / C), D) * Math.pow(0.9961, formdata['age']) * f;

            // Output the results
            results_desc_text.innerHTML = `<div class="point"><h2>${Math.round(g)}<small class="ss">mL/min/1.73 m²</small></h2><div>Estimated GFR</div><div>2021 CKD-EPI Creatinine-Cystatin C</div></div>`;
            results_desc_text.innerHTML += "<div class='seppep'></div>";
            results_desc_text.innerHTML += `<div class="point"><h2>${determineCKDStage(g)}</h2><div>CKD stage by CKD-EPI Creatinine</div></div>`;
            changeHasResult(result_mode, g);
            currentResult = `RESULT SUMMARY:
${Math.round(g)} mL/min/1.73 m²
Estimated GFR by 2021 CKD-EPI Creatinine-Cystatin C

${determineCKDStage(g)} CKD stage by CKD-EPI Creatinine


INPUTS:
Sex —> ${sex}
Age —> ${formdata['age']}
Serum creatinine —> ${formdata['creatinine']} ${creatine_units}
Serum cystatin C —> ${formdata['cystatin']} mg/L`;


        } else {
            noFields();
            lastResult = null;
        }
    }
}

function changeMode(newMode, highlights = true) {
    lastResult = null;
    result_mode = newMode.replace('radio_mode_', '');
    radio_mode_gault.classList.remove('segmented-unit-checked');
    radio_mode_mdrd.classList.remove('segmented-unit-checked');
    radio_mode_ckd.classList.remove('segmented-unit-checked');
    document.getElementById("mode_separator1").style.display = "none";
    document.getElementById("mode_separator2").style.display = "none";

    $(".highlight").removeClass("highlight");

    if (result_mode == "gault") {
        radio_mode_gault.classList.add('segmented-unit-checked');
        document.getElementById("mode_separator2").style.display = "block";
        if (highlights) {
            [age_input, radio_group_sex, weight_input, serum_creatinine_input, height_input].forEach((e) => { if (!e.value) e.classList.add("highlight") });
        }
    }
    if (result_mode == "mdrd") {
        radio_mode_mdrd.classList.add('segmented-unit-checked');
        if (highlights) {
            [age_input, radio_group_sex, serum_creatinine_input].forEach((e) => { if (!e.value) e.classList.add("highlight") });
        }
    }
    if (result_mode == "ckd") {
        radio_mode_ckd.classList.add('segmented-unit-checked');
        document.getElementById("mode_separator1").style.display = "block";
        if (highlights) {
            [age_input, radio_group_sex, serum_cystatin_input, serum_creatinine_input].forEach((e) => { if (!e.value) e.classList.add("highlight") });
        }
    }

    formValueChanged();
}



radio_mode_gault.addEventListener('click', () => { changeMode(radio_mode_gault.id); })
radio_mode_mdrd.addEventListener('click', () => { changeMode(radio_mode_mdrd.id); })
radio_mode_ckd.addEventListener('click', () => { changeMode(radio_mode_ckd.id); })

function formValueChanged() {
    calcCreatineClearence();
    saveToLocalStorage();
}

radio_sex_female.addEventListener('click', () => {
    sex = "female";
    sex_separator.style.display = "none";
    radio_sex_female.classList.add('segmented-unit-checked');
    radio_sex_male.classList.remove('segmented-unit-checked');
    radio_group_sex.value = sex;
    formValueChanged();
})
radio_sex_male.addEventListener('click', () => {
    sex = "male";
    sex_separator.style.display = "none";
    radio_sex_female.classList.remove('segmented-unit-checked');
    radio_sex_male.classList.add('segmented-unit-checked');
    radio_group_sex.value = sex;
    formValueChanged();
})

radio_yes.addEventListener('click', () => {
    black_race = "yes";
    black_race_separator.style.display = "none";
    radio_yes.classList.add('segmented-unit-checked');
    radio_no.classList.remove('segmented-unit-checked');
    radio_group_black_race.value = black_race;
    formValueChanged();
})
radio_no.addEventListener('click', () => {
    black_race = "no";
    black_race_separator.style.display = "none";;
    radio_yes.classList.remove('segmented-unit-checked');
    radio_no.classList.add('segmented-unit-checked');
    radio_group_black_race.value = black_race;
    formValueChanged();
})


function changeWeightUnits() {
    console.log(1)
    if (weight_units === "kg") {
        weight_units = "lbs";
        weight_input.setAttribute('placeholder', "2-330");
        weight_input.setAttribute('min', "2")
        weight_input.setAttribute('max', "330")
        const kg = weight_input.value;
        if (weight_input.value != "") {
            weight_input.value = (kg / 0.45359237).toFixed(1);
        }
    } else {
        weight_units = "kg";
        weight_input.setAttribute('placeholder', "1-150");
        weight_input.setAttribute('min', 1)
        weight_input.setAttribute('max', 150)
        const lbs = weight_input.value;
        if (weight_input.value != "") {
            weight_input.value = (lbs * 0.45359237).toFixed(1);
        }
    }
    weight_units_btn.setAttribute("value", weight_units);
    weight_units_btn.innerText = weight_units;
    calcCreatineClearence();
    localStorage.setItem('weight_units', weight_units);
}

function changeHightUnits() {
    if (height_units === "cm") {
        height_units = "in";

        let currentValue = parseFloat(height_input.value);
        let valueInches = (currentValue / 2.54).toFixed(2);

        height_input.setAttribute('placeholder', "60-84");
        height_input.setAttribute('min', 60);
        height_input.setAttribute('max', 84);

        if (height_input.value != "") {
            height_input.value = valueInches;
        }

    } else {
        height_units = "cm";
        let currentValue = parseFloat(height_input.value);

        height_input.setAttribute('placeholder', "152-213");
        height_input.setAttribute('min', 152);
        height_input.setAttribute('max', 213);

        if (height_input.value != "") {
            height_input.value = (currentValue * 2.54).toFixed(2);
        }
    }

    height_units_btn.setAttribute("value", height_units);
    height_units_btn.innerText = height_units;
    calcCreatineClearence();
    localStorage.setItem('height_units', height_units);
}

function changeCreatineUnits() {
    const creatinineValue = parseFloat(serum_creatinine_input.value);

    if (creatine_units === "mg/dL") {
        creatine_units = "µmol/L";
        serum_creatinine_input.setAttribute('placeholder', "62-115");
        serum_creatinine_input.setAttribute('min', 62)
        serum_creatinine_input.setAttribute('max', 115)
        // Convert to μmol/L  
        if (serum_creatinine_input.value != "") {
            serum_creatinine_input.value = (creatinineValue * 88.4).toFixed(2);
        }
    } else {
        creatine_units = "mg/dL";
        serum_creatinine_input.setAttribute('placeholder', "0.7-1.3");
        serum_creatinine_input.setAttribute('min', 0.7)
        serum_creatinine_input.setAttribute('max', 1.3)
        // Convert to mg/dL
        if (serum_creatinine_input.value != "") {
            serum_creatinine_input.value = (creatinineValue / 88.4).toFixed(2);
        }
    }
    serum_creatinine_units_btn.setAttribute("value", creatine_units);
    serum_creatinine_units_btn.innerText = creatine_units;

    calcCreatineClearence();
    localStorage.setItem('creatine_units', creatine_units);
}

serum_creatinine_units_btn.parentNode.addEventListener('click', changeCreatineUnits);
weight_units_btn.parentNode.addEventListener('click', changeWeightUnits);
height_units_btn.parentNode.addEventListener('click', changeHightUnits);

document.getElementById('black_question').addEventListener('mouseover', function (e) {
    var tooltip = document.getElementById('tooltip');
    var blackQuestion = document.getElementById('black_question');
    var blackQuestionRect = blackQuestion.getBoundingClientRect();

    tooltip.style.display = 'block';
});

document.getElementById('black_question').addEventListener('mouseout', function () {
    document.getElementById('tooltip').style.display = 'none';
});

let inputs = document.querySelectorAll("input")
inputs.forEach(element => {
    element.addEventListener("keyup", formValueChanged);
});

// Jquery

$(document).on("mouseenter", ".highlight", function () {
    $(this).toggleClass("highlight");
});
$(document).on("focus", ".highlight", function () {
    $(this).toggleClass("highlight");
});

function saveToLocalStorage() {
    localStorage.setItem('age', age_input.value);
    localStorage.setItem('weight', weight_input.value);
    localStorage.setItem('height', height_input.value);
    localStorage.setItem('serumCreatinine', serum_creatinine_input.value);
    localStorage.setItem('serumCystatin', serum_cystatin_input.value);
    localStorage.setItem('sex', sex);
    localStorage.setItem('blackRace', black_race);
    localStorage.setItem('result_mode', result_mode);

    localStorage.setItem('creatine_units', creatine_units);
    localStorage.setItem('weight_units', weight_units);
    localStorage.setItem('height_units', height_units);
}

// Adding event listeners to save inputs when they change
age_input.addEventListener('change', saveToLocalStorage);
weight_input.addEventListener('change', saveToLocalStorage);
height_input.addEventListener('change', saveToLocalStorage);
serum_creatinine_input.addEventListener('change', saveToLocalStorage);
serum_cystatin_input.addEventListener('change', saveToLocalStorage);

function loadFromLocalStorage() {
    console.log('loading from local storage');
    if (localStorage.getItem('creatine_units') === "µmol/L") {
        serum_creatinine_units_btn.click()
    };
    if (localStorage.getItem('weight_units') === "lbs") {
        weight_units_btn.click()
    };
    if (localStorage.getItem('height_units') === "in") {
        height_units_btn.click()
    };

    if (weight_units == "lbs") {
        weight_input.setAttribute('min', "2")
        weight_input.setAttribute('max', "330")
    } else {
        weight_input.setAttribute('min', "40")
        weight_input.setAttribute('max', "180")
    }

    if (creatine_units == "µmol/L") {
        serum_creatinine_input.setAttribute('min', "62")
        serum_creatinine_input.setAttribute('max', "115")
    } else {
        serum_creatinine_input.setAttribute('min', "0.7")
        serum_creatinine_input.setAttribute('max', "1.3")
    }

    if (height_units == "in") {
        height_input.setAttribute('min', 60);
        height_input.setAttribute('max', 84);
    } else {
        height_input.setAttribute('min', 152);
        height_input.setAttribute('max', 213);
    }
    age_input.setAttribute('min', 2);
    age_input.setAttribute('max', 200);

    serum_cystatin_input.setAttribute('min', 0.51);
    serum_cystatin_input.setAttribute('max', 0.98);

    age_input.value = localStorage.getItem('age') || '';
    weight_input.value = localStorage.getItem('weight') || '';
    height_input.value = localStorage.getItem('height') || '';
    serum_creatinine_input.value = localStorage.getItem('serumCreatinine') || '';
    serum_cystatin_input.value = localStorage.getItem('serumCystatin') || '';
    sex = localStorage.getItem('sex');
    black_race = localStorage.getItem('blackRace') || black_race;
    result_mode = localStorage.getItem('result_mode') || result_mode;



    if (sex === 'female') {
        radio_sex_female.click()
    } else if (sex === 'male') {
        radio_sex_male.click()
    }

    if (result_mode === 'gault') {
        changeMode(radio_mode_gault.id, highlights = false);
    } else if (result_mode === 'mdrd') {
        changeMode(radio_mode_mdrd.id, highlights = false);
    } else if (result_mode === 'ckd') {
        changeMode(radio_mode_ckd.id, highlights = false);
    }

    if (black_race === 'yes') {
        radio_yes.click()
    } else if (black_race === 'no') {
        radio_no.click()
    }
}

loadFromLocalStorage();
calcCreatineClearence();

