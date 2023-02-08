import axios from 'axios'

// create an axios instance
const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 20000 // request timeout
})

// request interceptor
service.interceptors.request.use(
    config => {
        // do something before request is sent
        return config
    },
    error => {
        // do something with request error
        console.log(error) // for debug
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
    */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    response => {
        // if the custom code is not 20000, it is judged as an error.
        return response
    },
    error => {
        console.log('err' + error) // for debug
        return Promise.reject(error)
    }
)

export function getSkills() {
    return service({
        url: 'https://api.guildwars2.com/v2/skills',
        method: 'get'
    })
}

export function getSkillsByIds(ids, lang = 'zh') {
    return service({
        url: 'https://api.guildwars2.com/v2/skills',
        method: 'get',
        params: { ids: ids, lang: lang }
    })
}

export function getSecializationsByIds(ids, lang = 'zh') {
    return service({
        url: 'https://api.guildwars2.com/v2/specializations',
        method: 'get',
        params: { ids: ids, lang: lang }
    })
}

export function getProfessions(profession) {
    return service({
        url: 'https://api.guildwars2.com/v2/professions/' + profession,
        method: 'get',
    })
}

export function getItemstats(ids, lang = 'zh') {
    return service({
        url: 'https://api.guildwars2.com/v2/itemstats',
        method: 'get',
        params: { ids: '50,112,137,138,139,140,141,142,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,175,176,520,559,575,581,583,584,585,586,588,591,592,593,594,595,596,599,600,601,602,605,616,625,626,627,628,629,630,631,636,656,657,658,659,660,661,662,663,664,665,686,689,690,693,700,740,753,754,755,756,799,800,1011,1012,1013,1014,1015,1026,1030,1031,1032,1035,1037,1038,1040,1041,1042,1043,1044,1046,1047,1048,1050,1051,1052,1063,1064,1065,1066,1067,1070,1071,1073,1075,1076,1077,1078,1085,1097,1098,1109,1111,1114,1115,1118,1119,1123,1125,1128,1130,1131,1134,1139,1140,1145,1153,1162,1163,1220,1222,1224,1225,1226,1227,1228,1229,1230,1231,1232,1262,1263,1264,1265,1267,1268,1269,1270,1271,1329,1337,1344,1345,1363,1364,1366,1367,1374,1377,1378,1379,1430,1436,1484,1486,1538,1539,1548,1549,1556,1559,1566,1681,1686,1687,1691,1694,1697,1706,1717', lang: lang }
    })
}