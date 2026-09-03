export const FRAMEWORK_IDS = ["zhang_classic", "yumoto_objective", "hu_six_state"];

export const DOMAINS = {
  sleep_emotion: {
    label: "睡眠与情志",
    hypotheses: [
      ["agitation_heat", "烦热/亢奋线索群", ["mind_racing", "irritable_hot", "dry_thirst"]],
      ["constraint_reactivity", "情绪与压力相关线索群", ["stress_linked", "chest_flank", "variable_course"]],
      ["deficiency_exhaustion", "疲劳与恢复不足线索群", ["fatigue", "palpitation", "poor_appetite"]],
      ["fluid_disturbance", "水饮/体位相关线索群", ["dizziness_position", "palpitation", "edema"]],
      ["digestive_disruption", "饮食胃肠干扰线索群", ["meal_linked", "bloating", "reflux"]],
      ["external_behavioral", "作息、物质或环境因素", ["shift_work", "caffeine_alcohol", "medication_change"]]
    ],
    questionIds: ["q_sleep_pattern", "q_sleep_mind", "q_sleep_day", "q_digestive_link", "q_temperature_cluster", "q_substance_change", "q_course", "q_impact"],
    mustConfirm: ["sleep_pattern", "duration", "daytime_impact", "substance_or_medication_change"],
    clinicianOnly: ["formal_pulse", "formal_abdominal_exam"]
  },
  upper_gi: {
    label: "上消化道",
    hypotheses: [
      ["reflux_upward", "反流/上逆线索群", ["reflux", "belching", "lying_worse"]],
      ["distention_stagnation", "胀满与排空不适线索群", ["bloating", "meal_linked", "belching_relief"]],
      ["cold_fluid", "清稀呕吐与冷感线索群", ["clear_vomit", "cold_preference_no", "warm_relief"]],
      ["heat_irritation", "灼热、口渴与烦热线索群", ["burning", "dry_thirst", "constipation"]],
      ["mixed_upper_lower", "上腹不适伴肠鸣便溏线索群", ["epigastric_block", "borborygmus", "loose_stool"]],
      ["structural_or_medication", "器质性或药物相关待排", ["weight_loss", "bleeding", "nsaid_or_new_med"]]
    ],
    questionIds: ["q_gi_dominant", "q_gi_meal", "q_gi_vomit", "q_stool_alarm", "q_weight_change", "q_medication_change", "q_course", "q_severity"],
    mustConfirm: ["dominant_sensation", "meal_relation", "vomiting_character", "weight_change"],
    clinicianOnly: ["epigastric_resistance", "splashing_sound", "formal_pulse"]
  },
  lower_gi: {
    label: "腹部与排便",
    hypotheses: [
      ["dry_retention", "干结与排出困难线索群", ["hard_stool", "straining", "dry_thirst"]],
      ["loose_cold", "稀便与冷食/受凉相关线索群", ["watery_stool", "cold_trigger", "warm_relief"]],
      ["urgent_heat", "急迫、灼热或黏液线索群", ["urgency", "burning", "mucus"]],
      ["alternating_reactive", "交替与压力相关线索群", ["alternating_stool", "stress_linked", "pain_relief_after_stool"]],
      ["food_related", "进食或特定食物相关线索群", ["food_trigger", "meal_linked", "acute_course"]],
      ["structural_inflammatory", "出血、持续痛或炎症待排", ["bleeding", "night_symptom", "fever"]]
    ],
    questionIds: ["q_stool_form", "q_stool_frequency", "q_bowel_pain_link", "q_stool_alarm", "q_food_trigger", "q_course", "q_hydration", "q_impact"],
    mustConfirm: ["stool_form", "frequency", "blood_or_black_stool", "abdominal_pain_relation"],
    clinicianOnly: ["abdominal_guarding", "formal_pulse", "rectal_exam"]
  },
  respiratory_ent: {
    label: "呼吸与耳鼻咽喉",
    hypotheses: [
      ["external_cold", "受凉后表浅呼吸道线索群", ["chill", "clear_discharge", "body_ache"]],
      ["external_heat", "发热咽痛与黄稠分泌物线索群", ["fever", "sore_throat", "yellow_discharge"]],
      ["phlegm_fluid", "痰多、清稀或哮鸣线索群", ["copious_sputum", "wheeze", "clear_sputum"]],
      ["dry_irritation", "干咳、干痒和少痰线索群", ["dry_cough", "throat_dry", "little_sputum"]],
      ["allergic_reactive", "季节/环境诱发线索群", ["itch_sneeze", "seasonal", "clear_discharge"]],
      ["lower_airway_risk", "气促、胸痛或低氧待排", ["breathlessness", "chest_pain", "cyanosis"]]
    ],
    questionIds: ["q_breathing_alarm", "q_sputum", "q_fever_chill", "q_nose_discharge", "q_trigger_environment", "q_duration", "q_night_breath", "q_impact"],
    mustConfirm: ["breathing_difficulty", "sputum_or_discharge", "fever", "duration"],
    clinicianOnly: ["lung_auscultation", "oxygen_saturation", "formal_pulse"]
  },
  chest_circulation: {
    label: "胸部、心悸与循环",
    hypotheses: [
      ["exertional_pressure", "活动相关胸部压迫线索群", ["exertional", "pressure", "radiation"]],
      ["rhythm_awareness", "心跳节律感异常线索群", ["palpitation", "sudden_onset", "irregular"]],
      ["anxiety_reactivity", "紧张/惊恐相关线索群", ["stress_linked", "hyperventilation", "tingling"]],
      ["fluid_circulation", "气短、水肿或平卧加重线索群", ["edema", "orthopnea", "night_breathlessness"]],
      ["musculoskeletal_chest", "动作或按压相关胸壁线索群", ["movement_linked", "tender_touch", "localized"]],
      ["urgent_cardiopulmonary", "急性心肺危险待排", ["fainting", "severe_breathlessness", "cold_sweat"]]
    ],
    questionIds: ["q_chest_alarm", "q_chest_exertion", "q_palpitation_pattern", "q_edema_breath", "q_chest_touch_move", "q_duration", "q_medication_change", "q_impact"],
    mustConfirm: ["chest_urgent", "exertion_relation", "palpitation_pattern", "edema_breath"],
    clinicianOnly: ["heart_auscultation", "ecg", "formal_pulse"]
  },
  head_neuro: {
    label: "头面、眩晕与感觉",
    hypotheses: [
      ["position_vertigo", "体位诱发旋转感线索群", ["spinning", "head_position", "brief_episode"]],
      ["lightheaded_deficiency", "眼前发黑/虚浮感线索群", ["lightheaded", "standing_trigger", "fatigue"]],
      ["headache_tension", "紧箍或压力相关头痛线索群", ["bandlike", "stress_linked", "neck_tension"]],
      ["headache_migraine_like", "搏动、怕光或恶心线索群", ["throbbing", "light_sensitive", "nausea"]],
      ["sensory_local", "眼耳鼻局部因素线索群", ["hearing_change", "vision_change", "sinus_pressure"]],
      ["acute_neurologic", "突发神经系统危险待排", ["sudden_worst", "weakness_one_side", "speech_change"]]
    ],
    questionIds: ["q_neuro_alarm", "q_dizziness_type", "q_headache_character", "q_position_trigger", "q_sensory_change", "q_duration", "q_hydration", "q_impact"],
    mustConfirm: ["neurologic_deficit", "dizziness_type", "position_trigger", "duration"],
    clinicianOnly: ["neurologic_exam", "nystagmus_exam", "formal_pulse"]
  },
  temperature_fluids: {
    label: "冷热、出汗与津液感受",
    hypotheses: [
      ["external_temperature", "环境/感染相关冷热变化", ["acute_course", "fever", "chill"]],
      ["heat_cluster", "热感、口渴与烦躁线索群", ["heat_intolerance", "dry_thirst", "irritable_hot"]],
      ["cold_cluster", "冷感、喜温与清稀排泄线索群", ["cold_intolerance", "warm_relief", "clear_urine"]],
      ["sweat_regulation", "自汗/盗汗及活动关系线索群", ["spontaneous_sweat", "night_sweat", "exertion"]],
      ["fluid_depletion", "饮水不足或体液丢失线索群", ["low_intake", "diarrhea_vomit", "dark_urine"]],
      ["endocrine_medication", "内分泌或药物因素待排", ["weight_change", "tremor", "medication_change"]]
    ],
    questionIds: ["q_measured_temperature", "q_temperature_cluster", "q_sweat_pattern", "q_thirst_drinking", "q_weight_change", "q_medication_change", "q_course", "q_impact"],
    mustConfirm: ["measured_temperature", "sweat_context", "thirst_and_intake", "weight_change"],
    clinicianOnly: ["thyroid_exam", "laboratory_tests", "formal_pulse"]
  },
  musculoskeletal: {
    label: "肌肉关节与疼痛",
    hypotheses: [
      ["mechanical_overuse", "动作/负荷相关线索群", ["movement_linked", "overuse", "rest_relief"]],
      ["cold_damp_reactive", "寒冷潮湿诱发线索群", ["cold_trigger", "damp_weather", "warm_relief"]],
      ["inflammatory_joint", "晨僵、肿热或多关节线索群", ["morning_stiffness", "swollen_hot", "multiple_joints"]],
      ["weakness_exhaustion", "乏力和耐力下降线索群", ["fatigue", "weakness", "exertion"]],
      ["radiating_nerve", "放射、麻木或无力线索群", ["radiating", "numbness", "weakness_focal"]],
      ["trauma_systemic", "外伤或系统性危险待排", ["trauma", "fever", "loss_function"]]
    ],
    questionIds: ["q_pain_alarm", "q_pain_mechanical", "q_pain_inflammatory", "q_pain_quality", "q_numb_weak", "q_duration", "q_weather_relation", "q_impact"],
    mustConfirm: ["pain_red_flag", "movement_relation", "joint_inflammation", "weakness_or_numbness"],
    clinicianOnly: ["range_of_motion_exam", "strength_exam", "formal_pulse"]
  },
  urinary_male: {
    label: "泌尿与男性相关",
    hypotheses: [
      ["frequency_fluid", "饮水/利尿物质相关尿频线索群", ["high_intake", "caffeine_alcohol", "large_volume"]],
      ["irritative_urinary", "尿急、尿痛或少量频繁线索群", ["urgency", "burning_urine", "small_volume"]],
      ["obstructive_voiding", "排尿等待/尿线变细线索群", ["hesitancy", "weak_stream", "incomplete_emptying"]],
      ["cold_deficiency_cluster", "夜尿、冷感和疲乏线索群", ["nocturia", "cold_intolerance", "fatigue"]],
      ["sexual_reproductive", "性功能/生殖相关线索群", ["sexual_change", "pelvic_discomfort", "stress_linked"]],
      ["renal_urgent", "血尿、发热腰痛或尿潴留待排", ["blood_urine", "fever_flank", "retention"]]
    ],
    questionIds: ["q_urine_alarm", "q_urine_pattern", "q_urine_pain", "q_fluid_diuretic", "q_nocturia", "q_sexual_context", "q_duration", "q_impact"],
    mustConfirm: ["urine_volume_pattern", "pain_or_blood", "night_frequency", "fluid_and_diuretic_intake"],
    clinicianOnly: ["prostate_exam", "urinalysis", "formal_pulse"]
  },
  gynecology: {
    label: "月经与妇科相关",
    hypotheses: [
      ["cycle_pain_cold", "经期冷痛、喜温线索群", ["cycle_linked", "cold_trigger", "warm_relief"]],
      ["cycle_pain_stasis", "固定刺痛、血块线索群", ["fixed_stabbing", "clots", "dark_blood"]],
      ["heavy_deficiency", "量多伴乏力头晕线索群", ["heavy_bleeding", "fatigue", "lightheaded"]],
      ["irregular_stress", "周期紊乱与压力相关线索群", ["irregular_cycle", "stress_linked", "sleep_change"]],
      ["discharge_local", "带下、瘙痒或异味线索群", ["discharge_change", "itch", "odor"]],
      ["pregnancy_acute_risk", "妊娠可能或急性盆腔危险待排", ["pregnancy_possible", "one_side_pain", "fainting"]]
    ],
    questionIds: ["q_gyn_alarm", "q_cycle_relation", "q_bleeding_amount", "q_cycle_regular", "q_discharge", "q_pregnancy_possible", "q_duration", "q_impact"],
    mustConfirm: ["gynecology_red_flag", "pregnancy_possibility", "cycle_relation", "bleeding_amount"],
    clinicianOnly: ["pelvic_exam", "pregnancy_test", "formal_pulse"]
  },
  skin_hair_edema: {
    label: "皮肤、毛发与水肿",
    hypotheses: [
      ["red_hot_itch", "红、热、痒线索群", ["red_hot", "itch", "acute_course"]],
      ["wet_oozing", "渗液、水疱或糜烂线索群", ["oozing", "blister", "damp"]],
      ["dry_scaling", "干燥、脱屑或裂口线索群", ["dry_scale", "crack", "chronic"]],
      ["pigment_thick", "色暗、增厚或久病线索群", ["dark_color", "thickened", "chronic"]],
      ["allergic_exposure", "接触/食物/药物诱发线索群", ["new_exposure", "sudden_spread", "itch"]],
      ["infection_systemic", "感染、严重过敏或全身水肿待排", ["fever", "face_swelling", "breathlessness"]]
    ],
    questionIds: ["q_skin_alarm", "q_skin_appearance", "q_skin_spread", "q_skin_exposure", "q_edema_pattern", "q_duration", "q_medication_change", "q_impact"],
    mustConfirm: ["skin_red_flag", "appearance", "distribution", "new_exposure_or_medication"],
    clinicianOnly: ["skin_palpation", "dermoscopy", "formal_pulse"]
  },
  general_constitution: {
    label: "全身感受与体力",
    hypotheses: [
      ["sleep_recovery", "睡眠不足/恢复不良线索群", ["poor_sleep", "morning_worse", "stress_linked"]],
      ["nutrition_digestive", "摄入与消化相关线索群", ["poor_appetite", "weight_loss", "meal_linked"]],
      ["cold_deficiency", "冷感、少气和耐力下降线索群", ["cold_intolerance", "short_breath_exertion", "fatigue"]],
      ["heat_consumption", "热感、口渴与消耗线索群", ["heat_intolerance", "dry_thirst", "weight_loss"]],
      ["mood_stress", "压力/情绪和功能波动线索群", ["stress_linked", "variable_course", "sleep_change"]],
      ["systemic_medical", "贫血、感染、内分泌或药物待排", ["fever", "bleeding", "medication_change"]]
    ],
    questionIds: ["q_general_alarm", "q_fatigue_pattern", "q_sleep_day", "q_appetite_weight", "q_temperature_cluster", "q_medication_change", "q_duration", "q_impact"],
    mustConfirm: ["duration", "functional_impact", "appetite_weight", "general_red_flag"],
    clinicianOnly: ["physical_exam", "laboratory_tests", "formal_pulse"]
  }
};

// Exactly 120 common, intentionally vague complaint classes. The fourth value is
// the best first discriminative question after the safety gate.
export const COMPLAINT_ROWS = [
  ["sleep_bad", "睡不好", "sleep_emotion", "q_sleep_pattern", ["失眠", "睡眠不佳"]],
  ["hard_to_fall_asleep", "入睡困难", "sleep_emotion", "q_sleep_mind", ["躺很久睡不着"]],
  ["wake_often", "夜里老醒", "sleep_emotion", "q_sleep_pattern", ["睡不踏实"]],
  ["wake_too_early", "醒得太早", "sleep_emotion", "q_sleep_pattern", ["凌晨就醒"]],
  ["many_dreams", "梦多", "sleep_emotion", "q_sleep_day", ["整晚做梦"]],
  ["restless_irritable", "心烦静不下来", "sleep_emotion", "q_sleep_mind", ["脑子停不下来"]],
  ["easily_startled", "容易受惊", "sleep_emotion", "q_palpitation_pattern", ["一点声音就吓到"]],
  ["low_mood_cry", "情绪低落想哭", "sleep_emotion", "q_general_alarm", ["莫名想哭"]],
  ["anxious", "总是焦虑", "sleep_emotion", "q_sleep_mind", ["心里发慌"]],
  ["poor_memory", "最近健忘", "sleep_emotion", "q_sleep_day", ["记性变差"]],

  ["stomach_uncomfortable", "胃不舒服", "upper_gi", "q_gi_dominant", ["胃难受"]],
  ["stomach_pain", "胃痛", "upper_gi", "q_gi_dominant", ["胃那里疼"]],
  ["bloating", "胃胀", "upper_gi", "q_gi_meal", ["吃一点就胀"]],
  ["acid_reflux", "反酸", "upper_gi", "q_gi_meal", ["酸水上来"]],
  ["heartburn", "烧心", "upper_gi", "q_gi_dominant", ["胸口烧灼"]],
  ["belching", "老打嗝嗳气", "upper_gi", "q_gi_meal", ["一直嗳气"]],
  ["nausea", "恶心", "upper_gi", "q_gi_vomit", ["想吐"]],
  ["vomiting", "呕吐", "upper_gi", "q_gi_vomit", ["吃了就吐"]],
  ["poor_appetite", "食欲差", "upper_gi", "q_appetite_weight", ["不想吃东西"]],
  ["throat_lump", "喉咙像堵着东西", "upper_gi", "q_gi_dominant", ["咽不下吐不出"]],

  ["abdomen_uncomfortable", "肚子不舒服", "lower_gi", "q_bowel_pain_link", ["腹部难受"]],
  ["abdominal_pain", "肚子痛", "lower_gi", "q_bowel_pain_link", ["腹痛"]],
  ["diarrhea", "腹泻", "lower_gi", "q_stool_form", ["拉肚子"]],
  ["loose_stool", "大便稀", "lower_gi", "q_stool_form", ["便溏"]],
  ["constipation", "便秘", "lower_gi", "q_stool_form", ["拉不出来"]],
  ["alternating_stool", "便秘腹泻交替", "lower_gi", "q_stool_form", ["大便忽干忽稀"]],
  ["frequent_stool", "大便次数多", "lower_gi", "q_stool_frequency", ["一天拉好多次"]],
  ["incomplete_stool", "大便拉不净", "lower_gi", "q_stool_frequency", ["总有便意"]],
  ["sticky_stool", "大便黏马桶", "lower_gi", "q_stool_form", ["大便很黏"]],
  ["gas", "屁多肠鸣", "lower_gi", "q_bowel_pain_link", ["肚子咕噜响"]],
  ["blood_in_stool", "便血", "lower_gi", "q_stool_form", ["大便带血", "便中带血", "拉血", "下血", "血便"]],
  ["hemorrhoid", "痔疮", "lower_gi", "q_stool_form", ["痔", "肛门坠胀", "肛门有肉球", "脱肛"]],

  ["cough", "咳嗽", "respiratory_ent", "q_sputum", ["一直咳"]],
  ["dry_cough", "干咳", "respiratory_ent", "q_sputum", ["咳不出痰"]],
  ["phlegm", "痰多", "respiratory_ent", "q_sputum", ["喉咙很多痰"]],
  ["wheeze", "喘鸣", "respiratory_ent", "q_breathing_alarm", ["呼噜呼噜喘"]],
  ["short_breath", "气短", "respiratory_ent", "q_breathing_alarm", ["不够气"]],
  ["sore_throat", "咽喉痛", "respiratory_ent", "q_fever_chill", ["吞咽痛"]],
  ["throat_dry", "咽干", "respiratory_ent", "q_thirst_drinking", ["嗓子干"]],
  ["stuffy_nose", "鼻塞", "respiratory_ent", "q_nose_discharge", ["鼻子不通"]],
  ["runny_nose", "流鼻涕", "respiratory_ent", "q_nose_discharge", ["鼻水多"]],
  ["sneeze_itch", "喷嚏鼻痒", "respiratory_ent", "q_trigger_environment", ["一直打喷嚏"]],

  ["chest_tight", "胸闷", "chest_circulation", "q_chest_exertion", ["胸口堵"]],
  ["chest_pain", "胸痛", "chest_circulation", "q_chest_alarm", ["胸口疼"]],
  ["palpitation", "心慌", "chest_circulation", "q_palpitation_pattern", ["心跳得慌"]],
  ["heart_racing", "心跳快", "chest_circulation", "q_palpitation_pattern", ["心跳突然很快"]],
  ["irregular_beat", "心跳乱", "chest_circulation", "q_palpitation_pattern", ["像漏跳"]],
  ["sighing", "总想叹气", "chest_circulation", "q_chest_exertion", ["深呼吸才舒服"]],
  ["breathless_exertion", "一活动就喘", "chest_circulation", "q_chest_exertion", ["走路就气喘"]],
  ["breathless_lying", "躺下憋气", "chest_circulation", "q_edema_breath", ["平躺不舒服"]],
  ["faint_feeling", "快要晕倒", "chest_circulation", "q_chest_alarm", ["眼前发黑要倒"]],
  ["cold_sweat_episodes", "突然冷汗心慌", "chest_circulation", "q_chest_alarm", ["一阵冷汗"]],

  ["dizzy", "头晕", "head_neuro", "q_dizziness_type", ["晕乎乎"]],
  ["vertigo", "天旋地转", "head_neuro", "q_position_trigger", ["房子在转"]],
  ["headache", "头痛", "head_neuro", "q_headache_character", ["脑袋疼"]],
  ["migraine_like", "偏头痛", "head_neuro", "q_headache_character", ["一边头疼"]],
  ["heavy_head", "头重昏沉", "head_neuro", "q_dizziness_type", ["头像裹着东西"]],
  ["tinnitus", "耳鸣", "head_neuro", "q_sensory_change", ["耳朵响"]],
  ["blurred_vision", "视物模糊", "head_neuro", "q_neuro_alarm", ["看东西不清"]],
  ["eye_dry", "眼干", "head_neuro", "q_sensory_change", ["眼睛涩"]],
  ["numb_face", "脸麻", "head_neuro", "q_neuro_alarm", ["半边脸发麻"]],
  ["brain_fog", "脑子昏沉", "head_neuro", "q_dizziness_type", ["脑雾"]],

  ["fear_cold", "怕冷", "temperature_fluids", "q_temperature_cluster", ["特别怕冷"]],
  ["fear_heat", "怕热", "temperature_fluids", "q_temperature_cluster", ["特别怕热"]],
  ["feverish", "感觉发热", "temperature_fluids", "q_measured_temperature", ["身上发烫"]],
  ["alternating_hot_cold", "忽冷忽热", "temperature_fluids", "q_measured_temperature", ["一会冷一会热"]],
  ["sweat_easy", "容易出汗", "temperature_fluids", "q_sweat_pattern", ["稍动就出汗"]],
  ["night_sweat", "睡觉盗汗", "temperature_fluids", "q_sweat_pattern", ["睡着后出汗"]],
  ["no_sweat", "该出汗却不出汗", "temperature_fluids", "q_sweat_pattern", ["发热也没汗"]],
  ["dry_mouth", "口干", "temperature_fluids", "q_thirst_drinking", ["嘴巴干"]],
  ["thirsty", "总口渴", "temperature_fluids", "q_thirst_drinking", ["一直想喝水"]],
  ["bitter_mouth", "口苦", "temperature_fluids", "q_temperature_cluster", ["嘴里发苦"]],

  ["low_back_ache", "腰酸", "musculoskeletal", "q_pain_mechanical", ["腰没劲"]],
  ["low_back_pain", "腰痛", "musculoskeletal", "q_pain_alarm", ["腰疼"]],
  ["neck_stiff", "脖子僵硬", "musculoskeletal", "q_numb_weak", ["颈肩僵"]],
  ["shoulder_pain", "肩痛", "musculoskeletal", "q_pain_mechanical", ["抬胳膊疼"]],
  ["knee_pain", "膝盖痛", "musculoskeletal", "q_pain_inflammatory", ["膝关节疼"]],
  ["joint_ache", "关节酸痛", "musculoskeletal", "q_pain_inflammatory", ["全身关节疼"]],
  ["muscle_ache", "肌肉酸痛", "musculoskeletal", "q_pain_mechanical", ["浑身酸"]],
  ["limb_numb", "手脚发麻", "musculoskeletal", "q_numb_weak", ["四肢麻木"]],
  ["leg_weak", "腿没力", "musculoskeletal", "q_numb_weak", ["腿软"]],
  ["cramp", "容易抽筋", "musculoskeletal", "q_pain_quality", ["小腿抽筋"]],

  ["frequent_urine", "小便次数多", "urinary_male", "q_urine_pattern", ["尿频"]],
  ["night_urine", "夜尿多", "urinary_male", "q_nocturia", ["夜里老起夜"]],
  ["urgent_urine", "尿急", "urinary_male", "q_urine_pain", ["憋不住尿"]],
  ["painful_urine", "小便疼", "urinary_male", "q_urine_alarm", ["尿痛"]],
  ["dark_urine", "尿黄", "urinary_male", "q_fluid_diuretic", ["小便颜色深"]],
  ["weak_stream", "尿线细没劲", "urinary_male", "q_urine_pattern", ["排尿无力"]],
  ["incomplete_urine", "尿不干净", "urinary_male", "q_urine_pattern", ["还有尿意"]],
  ["sexual_low", "性欲下降", "urinary_male", "q_sexual_context", ["没兴趣"]],
  ["erection_problem", "勃起状态变差", "urinary_male", "q_sexual_context", ["硬度不够"]],
  ["premature_ejaculation", "射精太快", "urinary_male", "q_sexual_context", ["早泄"]],

  ["period_pain", "月经痛", "gynecology", "q_cycle_relation", ["痛经"]],
  ["period_irregular", "月经不规律", "gynecology", "q_cycle_regular", ["周期乱"]],
  ["period_heavy", "月经量多", "gynecology", "q_bleeding_amount", ["经量很大"]],
  ["period_light", "月经量少", "gynecology", "q_bleeding_amount", ["经量少"]],
  ["period_clots", "月经血块多", "gynecology", "q_cycle_relation", ["很多血块"]],
  ["period_delayed", "月经推迟", "gynecology", "q_pregnancy_possible", ["月经没来"]],
  ["period_early", "月经提前", "gynecology", "q_cycle_regular", ["总提前来"]],
  ["vaginal_discharge", "白带异常", "gynecology", "q_discharge", ["带下多"]],
  ["pelvic_discomfort", "小腹坠胀", "gynecology", "q_gyn_alarm", ["下腹不舒服"]],
  ["menopause_discomfort", "更年期不舒服", "gynecology", "q_temperature_cluster", ["潮热心烦"]],

  ["skin_itch", "皮肤痒", "skin_hair_edema", "q_skin_appearance", ["身上发痒"]],
  ["rash", "起疹子", "skin_hair_edema", "q_skin_alarm", ["皮肤出红点"]],
  ["eczema_like", "湿疹反复", "skin_hair_edema", "q_skin_appearance", ["湿疹老不好"]],
  ["acne", "痘痘多", "skin_hair_edema", "q_skin_appearance", ["长痘"]],
  ["dry_skin", "皮肤干", "skin_hair_edema", "q_skin_appearance", ["皮肤脱皮"]],
  ["hair_loss", "掉头发", "skin_hair_edema", "q_duration", ["脱发"]],
  ["white_hair", "白头发变多", "skin_hair_edema", "q_duration", ["突然多了白发"]],
  ["face_swelling", "脸肿", "skin_hair_edema", "q_skin_alarm", ["眼皮肿"]],
  ["leg_edema", "腿脚肿", "skin_hair_edema", "q_edema_pattern", ["脚踝水肿"]],
  ["easy_bruise", "容易淤青", "skin_hair_edema", "q_general_alarm", ["轻轻碰就青"]],

  ["fatigue", "乏力", "general_constitution", "q_fatigue_pattern", ["没力气"]],
  ["feel_weak", "总觉得虚", "general_constitution", "q_fatigue_pattern", ["体虚", "虚弱"]],
  ["low_energy", "精神差", "general_constitution", "q_sleep_day", ["没精神"]],
  ["easily_tired", "容易累", "general_constitution", "q_fatigue_pattern", ["动一下就累"]],
  ["easy_ill", "总容易生病", "general_constitution", "q_duration", ["抵抗力差"]],
  ["internal_heat", "容易上火", "general_constitution", "q_temperature_cluster", ["上火", "火气大"]],
  ["heavy_damp", "感觉湿气重", "general_constitution", "q_gi_dominant", ["湿气重", "身体困重"]],
  ["cold_hands_feet", "手脚凉", "general_constitution", "q_temperature_cluster", ["四肢冰凉", "手脚冰凉", "手脚发凉", "手脚冰"]],
  ["weight_loss", "莫名变瘦", "general_constitution", "q_general_alarm", ["体重下降"]],
  ["weight_gain", "最近发胖", "general_constitution", "q_appetite_weight", ["体重增加"]]
];

const q = (id, factKey, prompt, options, meta = {}) => ({
  id, factKey, prompt, options: options.map(([value, label, signals = []]) => ({ value, label, signals })),
  reliability: meta.reliability ?? 0.9,
  burden: meta.burden ?? 1,
  decisionImpact: meta.decisionImpact ?? 0.8,
  userAnswerable: meta.userAnswerable ?? true,
  kind: meta.kind ?? "discriminator",
  repairFor: meta.repairFor ?? null
});

export const QUESTIONS = [
  q("q_safety_gate", "urgent_warning", "先确认安全：现在是否有突然出现且很重的症状，例如呼吸明显困难、意识不清、晕倒、单侧无力、呕血/黑便或止不住的出血？", [["yes", "有，且正在发生", ["urgent"]], ["no", "没有", []], ["unsure", "不确定", ["urgent"]]], {decisionImpact: 1, kind: "safety", burden: 0.8}),
  q("q_mental_alarm", "mental_safety", "最近是否出现过伤害自己、不想活，或已经无法保证自己安全的念头？", [["yes", "有，或现在不安全", ["urgent"]], ["no", "没有", []], ["prefer_not", "暂时不想回答", ["urgent"]]], {decisionImpact: 1, kind: "safety", burden: 1}),
  q("q_duration", "duration", "这个情况从什么时候开始？", [["hours_days", "几小时到几天", ["acute_course"]], ["weeks", "几周", []], ["months_years", "几个月或更久", ["chronic"]], ["episodic", "反复发作，中间会好", ["variable_course"]]]),
  q("q_course", "course", "从开始到现在，整体是在加重、减轻，还是反反复复？", [["worse", "越来越重", ["progressive"]], ["better", "在减轻", []], ["variable", "时好时坏", ["variable_course"]], ["stable", "差不多", []]]),
  q("q_severity", "severity", "最难受时按0到10分，大约几分？", [["mild", "0–3分", []], ["moderate", "4–6分", []], ["severe", "7–10分", ["severe"]]], {burden: 0.7}),
  q("q_impact", "functional_impact", "它具体影响了什么？", [["none", "基本不影响", []], ["daily", "影响工作/家务/上学", ["functional_loss"]], ["sleep", "主要影响睡眠", ["poor_sleep"]], ["cannot", "已经无法正常活动", ["loss_function"]]]),
  q("q_sleep_pattern", "sleep_pattern", "最主要是哪一种：很久睡不着、夜里常醒、太早醒，还是睡了仍不解乏？", [["onset", "入睡困难", ["mind_racing"]], ["maintenance", "夜里常醒", ["poor_sleep"]], ["early", "醒得过早", ["poor_sleep"]], ["unrested", "睡够也不解乏", ["fatigue"]]]),
  q("q_sleep_mind", "pre_sleep_state", "睡不着时更像哪一种？", [["racing", "脑子一直转、越想越清醒", ["mind_racing", "stress_linked"]], ["restless_hot", "身体或心里烦热，躺不住", ["irritable_hot"]], ["fear_startle", "紧张、害怕或容易惊醒", ["palpitation", "stress_linked"]], ["no_clear", "说不上来，就是睡不着", []]]),
  q("q_sleep_day", "daytime_after_sleep", "第二天主要有什么感觉？", [["fatigue", "疲乏没精神", ["fatigue"]], ["dizzy", "头晕心慌", ["lightheaded", "palpitation"]], ["irritable", "烦躁或注意力差", ["irritable_hot"]], ["normal", "白天影响不大", []]]),
  q("q_substance_change", "substance_or_medication_change", "最近咖啡、浓茶、酒、烟、保健品或药物有没有增加或更换？", [["yes", "有明显变化", ["caffeine_alcohol", "medication_change"]], ["no", "没有", []], ["unsure", "记不清", []]]),
  q("q_digestive_link", "digestive_link", "睡眠变差时，是否同时胃胀、反酸、吃撑或夜宵较多？", [["yes", "有明显关系", ["meal_linked", "bloating", "reflux"]], ["no", "没有", []], ["unsure", "没留意", []]]),
  q("q_gi_dominant", "dominant_sensation", "你说的“胃/肚子不舒服”，最接近疼、胀堵、烧灼、恶心，还是说不清的难受？", [["pain", "疼", ["fixed_stabbing"]], ["bloat", "胀或堵", ["bloating", "epigastric_block"]], ["burn", "烧灼/辣感", ["burning"]], ["nausea", "恶心想吐", ["clear_vomit"]], ["unclear", "暂时说不清", []]]),
  q("q_gi_meal", "meal_relation", "它和吃饭是什么关系？", [["empty", "空腹更明显", []], ["after", "饭后更明显", ["meal_linked", "bloating"]], ["specific", "油腻/辛辣/酒后明显", ["food_trigger", "burning"]], ["lying", "躺下或夜里更明显", ["lying_worse", "reflux"]], ["none", "看不出关系", []]]),
  q("q_gi_vomit", "vomiting_character", "有没有吐？如果有，最接近哪一种？", [["none", "没有吐", []], ["food", "吐食物", ["meal_linked"]], ["clear", "吐清水或痰涎样液体", ["clear_vomit"]], ["blood_coffee", "带血或像咖啡渣", ["bleeding", "urgent"]], ["cannot_keep", "连水都留不住", ["urgent"]]]),
  q("q_stool_form", "stool_form", "大便最接近哪一种？", [["hard", "干硬、颗粒或排出费力", ["hard_stool", "straining"]], ["formed", "成形", []], ["loose", "软烂不成形", ["loose_stool"]], ["watery", "水样", ["watery_stool"]], ["alternating", "忽干忽稀", ["alternating_stool"]]]),
  q("q_stool_frequency", "stool_frequency", "现在大约多久一次，或一天几次？", [["rare", "三天以上一次", ["hard_stool"]], ["normal", "一天1–2次或两天1次", []], ["frequent", "一天3次以上", ["urgency"]], ["urge_incomplete", "次数不一定多，但总觉得没排净", ["incomplete_emptying"]]]),
  q("q_bowel_pain_link", "pain_stool_relation", "腹部不适和排便有什么关系？", [["before_relief", "便前痛/胀，排完会缓解", ["pain_relief_after_stool"]], ["after", "排便后反而更不舒服", []], ["constant", "持续不缓解", ["progressive"]], ["none", "没关系或没留意", []]]),
  q("q_stool_alarm", "blood_or_black_stool", "有没有黑得像柏油的大便、明显鲜血，或持续呕血？", [["yes", "有", ["bleeding", "urgent"]], ["no", "没有", []], ["unsure", "不确定颜色", ["bleeding"]]], {decisionImpact: 1, kind: "safety"}),
  q("q_food_trigger", "food_trigger", "是否多人吃同样食物后都不舒服，或每次吃某类食物就发作？", [["cluster", "多人同时发作", ["food_trigger", "acute_course"]], ["specific", "特定食物反复诱发", ["food_trigger"]], ["no", "没有", []]]),
  q("q_hydration", "hydration", "最近喝水和排尿是否明显减少，站起来会眼前发黑吗？", [["yes", "是", ["low_intake", "dark_urine", "lightheaded"]], ["no", "不是", []], ["unsure", "不清楚", []]]),
  q("q_breathing_alarm", "breathing_difficulty", "现在呼吸是否明显费力、说不完整句话，或嘴唇发紫？", [["yes", "是", ["breathlessness", "cyanosis", "urgent"]], ["mild", "只是轻微气短", ["breathlessness"]], ["no", "没有", []]], {decisionImpact: 1, kind: "safety"}),
  q("q_sputum", "sputum", "咳嗽时痰最接近哪一种？", [["none", "干咳或几乎无痰", ["dry_cough", "little_sputum"]], ["clear", "白色清稀/泡沫样", ["clear_sputum", "copious_sputum"]], ["yellow", "黄稠或绿色", ["yellow_discharge"]], ["blood", "带血", ["bleeding", "urgent"]]]),
  q("q_fever_chill", "fever_chill", "有没有量过体温？同时更明显的是怕冷、发热，还是都没有？", [["chill", "怕冷/发冷明显", ["chill"]], ["fever", "体温升高或发热明显", ["fever"]], ["both", "先冷后热或两者都有", ["fever", "chill"]], ["none", "都没有", []]]),
  q("q_nose_discharge", "nasal_discharge", "鼻涕/分泌物是什么样？", [["clear", "清稀像水", ["clear_discharge"]], ["yellow", "黄稠", ["yellow_discharge"]], ["dry", "很少，主要干堵", ["throat_dry"]], ["none", "没有", []]]),
  q("q_trigger_environment", "environment_trigger", "是否在换季、接触灰尘/宠物/冷空气后反复出现？", [["yes", "是，关系明显", ["seasonal", "itch_sneeze"]], ["no", "没有明显关系", []], ["unsure", "没留意", []]]),
  q("q_night_breath", "night_breathing", "咳喘会不会在夜里或平躺后明显加重？", [["yes", "会", ["night_breathlessness", "orthopnea"]], ["no", "不会", []], ["unsure", "不确定", []]]),
  q("q_chest_alarm", "chest_urgent", "胸部不适是否突然很重，并伴冷汗、晕厥、明显气短，或向手臂/下颌/背部放射？", [["yes", "有其中一项", ["urgent", "radiation", "cold_sweat"]], ["no", "都没有", []], ["unsure", "不确定", ["urgent"]]], {decisionImpact: 1, kind: "safety"}),
  q("q_chest_exertion", "exertion_relation", "胸闷/气短和走路、爬楼等活动是什么关系？", [["worse", "活动时明显，休息后缓解", ["exertional", "pressure"]], ["rest", "静坐或紧张时出现", ["stress_linked"]], ["constant", "一直都有", ["progressive"]], ["none", "无明显关系", []]]),
  q("q_palpitation_pattern", "palpitation_pattern", "心慌时更像跳得快、跳得乱/漏拍，还是只是心跳感特别强？", [["fast", "突然很快", ["sudden_onset"]], ["irregular", "乱或漏拍", ["irregular"]], ["strong", "不一定快，但跳动感很强", ["palpitation"]], ["unsure", "分不清", []]]),
  q("q_edema_breath", "edema_breath", "是否同时脚踝肿、平躺憋气或夜里憋醒？", [["yes", "有", ["edema", "orthopnea", "night_breathlessness"]], ["no", "没有", []], ["unsure", "不确定", []]], {decisionImpact: 0.95}),
  q("q_chest_touch_move", "chest_wall_relation", "按压胸口、转身或抬手时，疼痛会被明确引出来吗？", [["yes", "会", ["tender_touch", "movement_linked", "localized"]], ["no", "不会", []], ["unsure", "不确定", []]]),
  q("q_neuro_alarm", "neurologic_deficit", "是否突然出现一侧脸/手脚无力或麻木、说话含糊、视力突然下降，或从未有过的爆炸样剧烈头痛？", [["yes", "有", ["urgent", "weakness_one_side", "speech_change", "sudden_worst"]], ["no", "没有", []], ["unsure", "不确定", ["urgent"]]], {decisionImpact: 1, kind: "safety"}),
  q("q_dizziness_type", "dizziness_type", "“晕”最接近哪种感觉？", [["spin", "自己或周围在转", ["spinning"]], ["faint", "发飘、眼前发黑，像要晕倒", ["lightheaded"]], ["heavy", "头重昏沉，不清醒", ["fatigue"]], ["unstable", "走路不稳", ["loss_function"]]]),
  q("q_headache_character", "headache_character", "头痛最接近哪一种？", [["throb", "一跳一跳", ["throbbing"]], ["band", "紧箍/压迫", ["bandlike"]], ["stabbing", "固定刺痛", ["fixed_stabbing"]], ["sudden", "突然达到最剧烈", ["sudden_worst", "urgent"]]]),
  q("q_position_trigger", "position_trigger", "转头、翻身或站起来时会立刻诱发吗？每次持续多久？", [["head_brief", "转头/翻身诱发，通常不到1分钟", ["head_position", "brief_episode"]], ["stand", "站起时眼前发黑", ["standing_trigger", "lightheaded"]], ["long", "与体位无关，持续较久", []], ["none", "无明显关系", []]]),
  q("q_sensory_change", "sensory_change", "是否同时耳鸣听力变化、怕光、视物变化或鼻窦胀痛？", [["ear", "耳鸣/听力变化", ["hearing_change"]], ["light", "怕光或恶心", ["light_sensitive", "nausea"]], ["vision", "视物变化", ["vision_change"]], ["sinus", "面颊/额头胀痛鼻塞", ["sinus_pressure"]], ["none", "都没有", []]]),
  q("q_measured_temperature", "measured_temperature", "你说的“发热/忽冷忽热”有量过体温吗？", [["measured_high", "量到过升高", ["fever"]], ["normal", "量过，体温正常", []], ["not_measured", "没量过", []]]),
  q("q_temperature_cluster", "temperature_pattern", "这种冷热感更接近哪一种？", [["cold", "别人不冷我也冷，喜欢热的", ["cold_intolerance", "warm_relief"]], ["heat", "别人不热我也热，想吹凉风", ["heat_intolerance"]], ["episodes", "一阵阵忽冷忽热", ["variable_course"]], ["hands", "主要只是手脚凉", []]]),
  q("q_sweat_pattern", "sweat_context", "出汗发生在什么时候、哪里？", [["day_easy", "白天稍动就出汗", ["spontaneous_sweat", "exertion"]], ["night", "睡着后出汗，醒来减轻", ["night_sweat"]], ["local", "手脚/头面局部", []], ["none", "并不多汗", []]]),
  q("q_thirst_drinking", "thirst_and_intake", "口干时是真的想喝水吗？更想喝冷的、热的，还是只想润一口？", [["cold_much", "很渴，想大量喝冷水", ["dry_thirst", "heat_intolerance"]], ["warm", "想喝温热的", ["cold_intolerance"]], ["sip", "口干但只小口润一下", []], ["no_thirst", "并不想喝", []]]),
  q("q_weight_change", "weight_change", "最近1–3个月体重有没有在没刻意控制的情况下明显变化？", [["loss", "明显下降", ["weight_loss"]], ["gain", "明显增加", ["weight_change"]], ["stable", "基本稳定", []], ["unknown", "没称过", []]], {decisionImpact: 0.9}),
  q("q_medication_change", "medication_change", "发作前是否新用了药、保健品、减肥产品，或调整了原有药量？", [["yes", "是", ["medication_change", "new_exposure"]], ["no", "没有", []], ["unsure", "不确定", []]]),
  q("q_pain_alarm", "pain_red_flag", "疼痛前是否有明显外伤，或同时发热、肢体无力、大小便控制异常？", [["yes", "有", ["trauma", "fever", "loss_function", "urgent"]], ["no", "没有", []], ["unsure", "不确定", ["urgent"]]], {decisionImpact: 1, kind: "safety"}),
  q("q_pain_mechanical", "movement_relation", "疼痛和动作/负重是什么关系？", [["move_worse", "一动或负重就加重", ["movement_linked", "overuse"]], ["rest_worse", "久坐久躺后更明显，活动开会缓解", ["morning_stiffness"]], ["rest_relief", "休息后减轻", ["rest_relief"]], ["none", "无明显关系", []]]),
  q("q_pain_inflammatory", "joint_inflammation", "关节有没有明显红、肿、热，或早晨僵硬超过半小时？", [["yes", "有", ["swollen_hot", "morning_stiffness"]], ["no", "没有", []], ["unsure", "说不准", []]]),
  q("q_pain_quality", "pain_quality", "最接近酸胀、刺痛、灼痛、电击样，还是抽筋？", [["ache", "酸胀", []], ["stabbing", "固定刺痛", ["fixed_stabbing"]], ["burn_electric", "灼痛/电击样", ["radiating"]], ["cramp", "抽筋或拘紧", []]]),
  q("q_numb_weak", "weakness_or_numbness", "是否有从腰/颈向手脚放射的痛麻，或真正拿不住、抬不动？", [["radiate", "有放射痛麻", ["radiating", "numbness"]], ["weak", "有明确无力", ["weakness_focal", "loss_function"]], ["both", "两者都有", ["radiating", "weakness_focal"]], ["no", "都没有", []]]),
  q("q_weather_relation", "weather_relation", "是否每逢受凉、阴雨潮湿就明显加重，保暖后减轻？", [["yes", "是", ["cold_trigger", "damp_weather", "warm_relief"]], ["no", "不是", []], ["unsure", "没留意", []]]),
  q("q_urine_alarm", "urinary_red_flag", "有没有肉眼血尿、发热伴腰背剧痛、完全尿不出，或妊娠期尿痛？", [["yes", "有", ["blood_urine", "fever_flank", "retention", "urgent"]], ["no", "没有", []], ["unsure", "不确定", ["urgent"]]], {decisionImpact: 1, kind: "safety"}),
  q("q_urine_pattern", "urine_volume_pattern", "每次尿量和排尿过程最接近哪种？", [["large", "次数多且每次量也多", ["large_volume"]], ["small_urgent", "次数多但每次很少、很急", ["small_volume", "urgency"]], ["weak", "等待、尿线细或断续", ["hesitancy", "weak_stream"]], ["incomplete", "排完仍觉得没排净", ["incomplete_emptying"]]]),
  q("q_urine_pain", "urine_pain_or_urgency", "排尿时有没有灼痛、尿急或下腹痛？", [["burn", "灼痛", ["burning_urine"]], ["urgent", "尿急明显", ["urgency"]], ["pelvic", "下腹/会阴不适", ["pelvic_discomfort"]], ["none", "都没有", []]]),
  q("q_fluid_diuretic", "fluid_and_diuretic_intake", "尿多/尿黄前，喝水、啤酒、咖啡、浓茶或利尿药有什么变化？", [["diuretic", "酒/咖啡/茶或利尿药增加", ["caffeine_alcohol", "high_intake"]], ["low_water", "喝水少、出汗多", ["low_intake", "dark_urine"]], ["none", "没有明显变化", []]]),
  q("q_nocturia", "night_frequency", "夜里通常起几次？每次尿量多不多？", [["zero_one", "0–1次", []], ["two_plus_large", "2次以上且量多", ["nocturia", "large_volume"]], ["two_plus_small", "2次以上但量少", ["nocturia", "small_volume"]]]),
  q("q_sexual_context", "sexual_context", "变化是突然还是逐渐？晨间状态、欲望和压力是否一起变化？", [["sudden_stress", "突然且与压力明显相关", ["stress_linked"]], ["gradual", "逐渐变化", ["chronic"]], ["pain", "伴疼痛或明显弯曲", ["pelvic_discomfort"]], ["unsure", "说不清", []]]),
  q("q_gyn_alarm", "gynecology_red_flag", "是否可能怀孕，并有单侧剧烈小腹痛、晕厥，或出血量大到连续每小时浸透一片卫生巾？", [["yes", "有其中一项", ["pregnancy_possible", "one_side_pain", "heavy_bleeding", "urgent"]], ["no", "都没有", []], ["unsure", "不确定是否怀孕", ["pregnancy_possible"]]], {decisionImpact: 1, kind: "safety"}),
  q("q_cycle_relation", "cycle_relation", "不适主要出现在月经前、经期、经后，还是和周期无关？", [["before", "经前", ["cycle_linked", "stress_linked"]], ["during", "经期", ["cycle_linked"]], ["after", "经后", ["fatigue"]], ["unrelated", "无明显关系", []]]),
  q("q_bleeding_amount", "bleeding_amount", "和你平时相比，量怎样？有没有大血块、头晕心慌？", [["heavy", "明显增多/大血块", ["heavy_bleeding", "clots"]], ["light", "明显减少", []], ["usual", "和平时差不多", []], ["dizzy", "量多并头晕心慌", ["heavy_bleeding", "lightheaded", "palpitation"]]]),
  q("q_cycle_regular", "cycle_regularity", "最近三次月经间隔是否大致稳定？", [["stable", "大致稳定", []], ["early", "经常提前", ["irregular_cycle"]], ["late", "经常推迟", ["irregular_cycle"]], ["variable", "忽早忽晚", ["irregular_cycle", "variable_course"]]]),
  q("q_discharge", "discharge_change", "白带与平时相比，颜色、气味、量和瘙痒有什么变化？", [["clear", "清稀量多，无明显异味", ["discharge_change"]], ["yellow_odor", "黄/黄绿且有异味", ["odor"]], ["curd_itch", "豆渣样并瘙痒", ["itch"]], ["none", "没明显变化", []]]),
  q("q_pregnancy_possible", "pregnancy_possibility", "这次月经变化是否存在怀孕可能？", [["yes", "有可能", ["pregnancy_possible"]], ["no", "确定没有", []], ["unsure", "不确定", ["pregnancy_possible"]]], {decisionImpact: 1}),
  q("q_skin_alarm", "skin_red_flag", "皮疹/肿胀是否伴呼吸困难、嘴唇舌头肿、大片起泡脱皮、高热或眼口黏膜疼？", [["yes", "有", ["urgent", "face_swelling", "breathlessness"]], ["no", "没有", []], ["unsure", "不确定", ["urgent"]]], {decisionImpact: 1, kind: "safety"}),
  q("q_skin_appearance", "appearance", "皮肤现在最接近哪种样子？", [["red_hot", "红、热、痒", ["red_hot", "itch"]], ["wet", "水疱、渗液或糜烂", ["oozing", "blister"]], ["dry", "干燥、脱屑或裂口", ["dry_scale", "crack"]], ["dark_thick", "颜色暗、皮肤增厚", ["dark_color", "thickened"]], ["none", "外观看不明显", []]]),
  q("q_skin_spread", "distribution", "它分布在哪里，扩散速度怎样？", [["local", "局限一小片", ["localized"]], ["symmetric", "两侧大致对称", ["chronic"]], ["rapid", "短时间迅速扩散", ["sudden_spread"]], ["whole", "全身多处", ["progressive"]]]),
  q("q_skin_exposure", "new_exposure_or_medication", "发作前是否换了药、护肤品、洗涤剂、食物，或接触新环境？", [["yes", "有", ["new_exposure", "medication_change"]], ["no", "没有", []], ["unsure", "记不清", []]]),
  q("q_edema_pattern", "edema_pattern", "肿胀主要何时出现，按下去会不会留下凹坑？", [["morning_face", "早晨脸/眼皮明显", ["face_swelling"]], ["evening_leg", "傍晚脚踝明显", ["edema"]], ["pitting", "按压后凹坑一会不恢复", ["edema"]], ["not_sure", "说不清", []]]),
  q("q_general_alarm", "general_red_flag", "是否有持续高热、明显出血、短期体重骤降、意识变化或虚弱到无法站立？", [["yes", "有", ["urgent", "fever", "bleeding", "weight_loss", "loss_function"]], ["no", "没有", []], ["unsure", "不确定", ["urgent"]]], {decisionImpact: 1, kind: "safety"}),
  q("q_fatigue_pattern", "fatigue_pattern", "你说的“虚/没力”，更接近哪一种？", [["sleepy", "困、想睡", ["poor_sleep"]], ["muscle", "肌肉没力，活动耐力差", ["weakness", "exertion"]], ["breath", "一动就气短心慌", ["short_breath_exertion", "palpitation"]], ["motivation", "身体能动，但提不起精神", ["stress_linked"]], ["unclear", "暂时分不清", []]]),
  q("q_appetite_weight", "appetite_weight", "食量和体重最近有什么变化？", [["less_loss", "吃得少且变瘦", ["poor_appetite", "weight_loss"]], ["more_loss", "吃得多却变瘦", ["heat_intolerance", "weight_loss"]], ["gain", "食量没少但体重增加", ["weight_change"]], ["stable", "都稳定", []]])
];

export const LANGUAGE_SEEDS = [
  ["上火", "非标准症状标签", ["口腔灼痛/溃疡", "咽痛", "口干口渴", "便干", "尿色深", "痘疹", "烦热"], "不得直接归为热证；先拆成可观察事实"],
  ["湿气重", "非标准症状标签", ["身体困重", "头重昏沉", "胃口差", "腹胀", "大便黏/稀", "浮肿", "痰多"], "不得直接归为湿证；要求用户选具体表现"],
  ["体虚", "非标准症状标签", ["容易疲劳", "活动耐力下降", "气短", "食欲下降", "容易出汗", "怕冷", "反复生病"], "不得直接归为虚证"],
  ["胃不舒服", "部位+模糊不适", ["疼痛", "胀满", "烧灼", "反酸", "恶心", "早饱"], "先问主感觉，再问饮食关系"],
  ["心慌", "心悸主观感", ["心跳快", "心跳乱/漏拍", "心跳感强", "伴气短/胸痛/晕厥"], "先排危险伴随症状"],
  ["头晕", "眩晕/头昏待分", ["旋转感", "眼前发黑", "昏沉", "站立不稳"], "不要把所有“晕”当作同一症状"],
  ["睡不好", "睡眠障碍待分", ["入睡困难", "睡眠维持困难", "早醒", "睡后不解乏"], "记录频率、持续时间、日间影响"],
  ["手脚凉", "末梢冷感", ["仅手足冷", "全身怕冷", "颜色变化", "麻木疼痛", "遇冷诱发"], "不能单独推出阳虚"],
  ["肾虚", "用户自我诊断", ["腰酸", "夜尿", "性功能变化", "乏力", "耳鸣"], "保留原话为自我解释，不写入事实结论"],
  ["肝火旺", "用户自我诊断", ["烦躁", "口苦", "头痛", "目赤", "睡眠差"], "拆成事实，不确认用户诊断"],
  ["寒气重", "用户自我解释", ["怕冷", "受凉加重", "喜温", "清稀分泌物", "腹泻"], "不得等同寒证"],
  ["气血不足", "用户自我诊断", ["乏力", "头晕", "心悸", "面色变化", "月经量变化"], "需医生结合检查，必要时排除贫血等"],
  ["胸口堵", "胸部压迫/闷感", ["胸闷", "胸痛", "气短", "咽部异物感", "上腹胀"], "先问活动关系和危险伴随症状"],
  ["喉咙有东西", "咽部异物感", ["吞咽困难", "吞咽痛", "异物感", "反酸", "情绪关系"], "真性吞咽困难需单独标记"],
  ["没精神", "精力下降", ["嗜睡", "疲劳", "动力下降", "注意力下降"], "问功能影响和睡眠"],
  ["内热", "主观热感", ["怕热", "潮热", "体温升高", "手足心热", "盗汗"], "必须区分体温与主观热感"]
];

export const SOURCES = [
  {id:"zhang_shanghan", title:"《伤寒论》通行本文本", url:"https://ctext.org/wiki.pl?if=gb&res=592661", use:"仅作条文定位；正式入库需与可靠点校本复核", level:"primary_text_needs_collation"},
  {id:"zhang_jingui", title:"《金匮要略》电子全文", url:"https://ctext.org/jinkui-yaolue/zh", use:"杂病症状组合和方证条文定位", level:"primary_text_needs_collation"},
  {id:"yumoto_kokan", title:"湯本求真《皇漢医学》馆藏记录", url:"https://jpsearch.go.jp/item/dignl-1379123", use:"确认原著书目与馆藏；具体主张必须逐页锚定", level:"primary_bibliographic"},
  {id:"yumoto_abdomen_2026", title:"六経弁証に基づく『皇漢医学』における腹証の解析", url:"https://www.jstage.jst.go.jp/article/kampomed/76/4/76_279/_article/-char/ja", use:"研究腹证、主观症状词汇和方药—腹证对应；不等同汤本本人原话", level:"secondary_peer_reviewed"},
  {id:"hu_lecture", title:"《胡希恕伤寒论讲座（中日录音增补版）》", isbn:"9787513223995", publisher:"中国中医药出版社", year:2016, use:"逐条核对胡希恕讲述；未核页码内容不得冠以“胡老说”", level:"edited_transcript"},
  {id:"who_terms", title:"WHO International Standard Terminologies on Traditional Medicine in the Western Pacific Region", url:"https://www.who.int/publications/i/item/9789240042322", year:2022, use:"术语规范化参考，不作为个案诊断规则", level:"terminology_standard"},
  {id:"cn_terms", title:"《中医病证分类与代码》《中医临床诊疗术语》通知", url:"https://www.natcm.gov.cn/yizhengsi/zhengcewenjian/2020-11-23/18461.html", year:2020, use:"专业输出字段和代码接口参考", level:"official_standard_notice"},
  {id:"gb_codes", title:"GB/T 15657-2021 中医病证分类与代码", url:"https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=41FD9D06E5BE4F84EA1D8D07101BED2C", year:2021, use:"代码映射接口；不把用户主诉自动编码成证候", level:"national_standard"}
];
