document.write('<script type="text/javascript" src="https://unpkg.com/dexie@latest/dist/dexie.js"></script>')

var gw2db = new Dexie('gw2database')

class Gw2APIServer {
    AddItemid(ids) {
        let list_item_id = []
        for (let i in ids) {
            list_item_id.push({ item_id: ids[i] })
        }
        gw2db.tab_gw_item_list.bulkAdd(list_item_id);
    }

    SetItemInfo(list_item_info) {
        gw2db.tab_gw_item_info.bulkPut(list_item_info)
    }

    SetItemName(item_id, item_name) {
        gw2db.tab_gw_item_info.update(item_id, { name_en: item_name })
    }
}

var gw2api_server = new Gw2APIServer()

class Gw2Item {
    constructor() {
        this.Gw2ItemIds = []
        this.UpdateIds = []

        gw2db.version(1).stores({
            tab_gw_item_list: "++id,&item_id"
        });

        gw2db.version(1).stores({
            tab_gw_item_info: "&id,name,name_en"
        });
    }

    GetItemInfoByIds(ids) {
        // if (ids.length == 0) {return}
        var str_id = ids.slice(0, 200).join(",")
        SearchItemsV2(str_id)
        if (ids.length > 200) {
            this.GetItemInfoByIds(ids.slice(200))
        }
    }

    async CheckComplete() {
        var result = await gw2db.tab_gw_item_info.toArray().then(items => {
            return $(this.Gw2ItemIds).not(items.map(item => { return item.id }))
        })

        return Object.keys(result).map(key => result[key])
    }

    async GetItemsCount() {
        return await gw2db.tab_gw_item_info.count()
    }

    async FindItemsByName(name) {
        if (name == null || name == "") {
            return await gw2db.tab_gw_item_info.toArray()
        } else {
            var result = await gw2db.tab_gw_item_info
                .filter(item => { if (item.name) { return item.name.includes(name) } else if (item.name_en) { item.name_en.includes(name) } })
                // .or().filter(item => {return /name/.test(item.name_en)})
                .toArray()
            return result
        }
    }

    async UpdateAPI() {
        this.Gw2ItemIds = GetInfoFromWikiV2("items")
        this.UpdateIds = await this.CheckComplete()
        if (this.UpdateIds && this.UpdateIds[0].length == 0) { return }
        gw2api_server.AddItemid(this.UpdateIds)
        this.GetItemInfoByIds(this.UpdateIds)
    }
}

class Gw2Skill {
    constructor() {
        this.Gw2Skills = {}
        this.Gw2SkillIds = []
        this.Gw2LocalSkill = []
    }

    CheckComplete() {
        var result = []
        for (var i in this.Gw2SkillIds) {
            if (this.Gw2Skills[this.Gw2SkillIds[i]] == null) {
                result.push(this.Gw2SkillIds[i])
            }
        }

        return result
    }

    IdsPut(info) {
        var isRepeat
        for (var i in this.Gw2LocalSkill) {
            isRepeat = true
            for (var j in this.Gw2LocalSkill[i]) {
                if (this.Gw2LocalSkill[i][j] != info[j]) {
                    isRepeat = false
                }
            }
            if (isRepeat && i != 0) { return }
        }

        this.Gw2LocalSkill.push(info)
    }

    IdsSort() {
        return function (first, second) {
            var a = first.type
            var b = second.type
            if (typeof (a) === typeof (first.id) || a === "flip_skill") {
                return 0;
            } else {
                return 1
            }
        }
    }

    GetSkillInfoByIds(ids) {
        var str_id = ids.slice(0, 200).join(",")
        SearchSkillsV2(str_id)
        if (ids.length > 200) {
            this.GetSkillInfoByIds(ids.slice(200))
        }
    }

    GetRelationSkill(id, isFirst) {
        if (isFirst) { this.Gw2LocalSkill = [] }
        var skill = Gw2SkillsZH[id]
        if (skill.next_chain) {
            this.IdsPut({ id: skill.next_chain, pre_id: id, type: "next_chain", notUsed: true, info: skill })
            this.GetRelationSkill(skill.next_chain)
        }
        if (skill.flip_skill) {
            this.IdsPut({ id: skill.flip_skill, pre_id: id, type: "flip_skill", notUsed: true, info: skill })
            this.GetRelationSkill(skill.flip_skill)
        }
    }

    FindSkillsByProfession(profession) {
        var a = GetInfoFromWikiV2("professions/" + profession + "?lang=zh")
        a.combos = {}
        a.special = {}
        var b = []
        var symbol = ["bundle_skills", "transform_skills"]
        for (var i in a.skills) {
            b.push(Gw2SkillsZH[a.skills[i].id])
        }
        for (var i in a.weapons) {
            for (var j in a.weapons[i].skills) {
                b.push(Gw2SkillsZH[a.weapons[i].skills[j].id])
            }
        }

        for (var i in b) {
            this.GetRelationSkill(b[i].id, true)
            this.Gw2LocalSkill.sort(this.IdsSort())
            if (this.Gw2LocalSkill.length > 0) { a.combos[b[i].id] = this.Gw2LocalSkill }
            for (var j in symbol) {
                if (b[i][symbol[j]]) {
                    a.special[b[i].id] = [b[i].id].concat(b[i][symbol[j]])
                }
            }
        }

        return a
    }

    UpdateAPI() {
        this.Gw2SkillIds = GetInfoFromWikiV2("skills")
        this.GetSkillInfoByIds(this.CheckComplete())
    }
}

class Gw2Trait {
    constructor() {
        this.Gw2Traits = {}
        this.Gw2TraitIds = []
    }

    GetTraitInfoByIds(ids) {
        var str_id = ids.slice(0, 200).join(",")
        SearchTraitsV2(str_id)
        if (ids.length > 200) {
            this.GetTraitInfoByIds(ids.slice(200))
        }
    }

    CheckComplete() {
        var Result = []
        for (var i in this.Gw2TraitIds) {
            if (this.Gw2Traits[this.Gw2TraitIds[i]] == null) {
                Result.push(this.Gw2TraitIds[i])
            }
        }

        return Result
    }

    UpdateAPI() {
        this.Gw2TraitIds = GetInfoFromWikiV2("traits")
        this.GetTraitInfoByIds(this.CheckComplete())
    }
}

class Gw2Itemstats {
    constructor() {
        this.Gw2Itemstats = {}
        this.Gw2ItemstatIds = []
        this.Gw2ItemstatNames = []
    }

    GetItemstatsInfoByIds(ids) {
        var str_id = ids.slice(0, 200).join(",")
        SearchItemstatsV2(str_id)
        if (ids.length > 200) {
            this.GetItemstatsInfoByIds(ids.slice(200))
        }
    }

    CheckComplete() {
        var Result = []
        for (var i in this.Gw2ItemstatIds) {
            if (this.Gw2Itemstats[this.Gw2ItemstatIds[i]] == null) {
                Result.push(this.Gw2ItemstatIds[i])
            }
        }

        return Result
    }

    MergeInfo() {
        for (var i in Gw2ItemstatsZH) {
            if (this.Gw2Itemstats[i] != null) { continue }
            // || this.Gw2ItemstatNames.indexOf(Gw2ItemstatsZH[i].name) != -1
            this.Gw2Itemstats[i] = Gw2ItemstatsZH[i]
            this.Gw2ItemstatNames.push(Gw2ItemstatsZH[i].name)
            var attribut = []
            for (var j in Gw2ItemstatsZH[i].attributes) {
                this.Gw2Itemstats[i][Gw2ItemstatsZH[i].attributes[j].attribute] = Gw2ItemstatsZH[i].attributes[j].multiplier
                // this.Gw2Itemstats[i][j] = Gw2ItemstatsZH[i].attributes[j]
                // attribut.push(Gw2Attribute[j] + ":" + Gw2ItemstatsZH[i].attributes[j])
                attribut.push(Gw2Attribute[Gw2ItemstatsZH[i].attributes[j].attribute])
            }
            this.Gw2Itemstats[i]["desc"] = attribut.join('|')
        }
    }

    GetItemsCount() {
        var count = 0;
        for (var key in this.Gw2Itemstats) {
            count++
        }
        return count
    }

    UpdateAPI() {
        this.Gw2ItemstatIds = GetInfoFromWikiV2("itemstats")
        this.GetItemstatsInfoByIds(this.CheckComplete())
    }
}

class Gw2Recipe {
    constructor() {
        this.Gw2Recipes = {}
        this.Gw2RecipeIds = []
        this.GwRecipeOutPutIds = []
    }

    GetRecipeByIds(ids) {
        var str_id = ids.slice(0, 200).join(",")
        SearchRecipesV2(str_id)
        if (ids.length > 200) {
            this.GetRecipeByIds(ids.slice(200))
        }
    }

    GetItemsCount() {
        var count = 0;
        for (var key in this.Gw2Recipes) {
            count++
        }
        return count
    }

    FindRecpiesByProfession(profession) {
        // if (profession.length == 0){
        // return this.Gw2Recipes
        // }
        var a = {}
        for (var i in this.Gw2Recipes) {
            for (var j in profession) {
                if (this.Gw2Recipes[i].disciplines.indexOf(profession[j]) != -1) {
                    a[this.Gw2Recipes[i].output_item_id] = this.Gw2Recipes[i]
                    break
                }
            }
        }
        return a
    }

    CheckComplete() {
        var Result = []
        for (var i in this.Gw2RecipeIds) {
            if (this.Gw2Recipes[this.Gw2RecipeIds[i]] == null) {
                Result.push(this.Gw2RecipeIds[i])
            }
        }

        return Result
    }

    MergeInfo() {
        for (var i in Gw2RecipesZH) {
            if (this.Gw2Recipes[i] != null) { continue }
            this.Gw2Recipes[i] = Gw2RecipesZH[i]
            this.GwRecipeOutPutIds.push(Gw2RecipesZH[i].output_item_id)
        }
    }

    UpdateAPI() {
        this.Gw2RecipeIds = GetInfoFromWikiV2("recipes")
        this.GetRecipeByIds(this.CheckComplete())
    }
}

function GetInfoFromWikiV2(api) {
    var result = []
    $.ajax({
        async: false,
        type: "GET",
        url: "https://api.guildwars2.com/v2/" + api,
        success: function (data) {
            result = data
        }
    })

    return result
}

function SearchItemsV2(ids) {
    $.ajax({
        type: "GET",
        data: {
            ids: ids,
            lang: "zh",
        },
        url: "https://api.guildwars2.com/v2/items",
        success: function (data, textStatus, jqXHR) {
            gw2api_server.SetItemInfo(data)
        },
        complete: function (jqXHR, textStatus) { }
    })

    $.ajax({
        type: "GET",
        data: {
            ids: ids,
            lang: "en",
        },
        url: "https://api.guildwars2.com/v2/items",
        success: function (data, textStatus, jqXHR) {
            for (var i in data) {
                gw2api_server.SetItemName(data[i].id, data[i].name)
            }
        }
    })
}

Gw2SkillsZH = {}
function SearchSkillsV2(ids) {
    $.ajax({
        type: "GET",
        data: {
            ids: ids,
            lang: "zh",
        },
        url: "https://api.guildwars2.com/v2/skills",
        success: function (data, textStatus, jqXHR) {
            for (var i in data) {
                Gw2SkillsZH[data[i].id] = data[i]
            }
        },
        complete: function (jqXHR, textStatus) { }
    })
}

Gw2traitsZH = {}
function SearchTraitsV2(ids) {
    $.ajax({
        type: "GET",
        data: {
            ids: ids,
            lang: "zh",
        },
        url: "https://api.guildwars2.com/v2/traits",
        success: function (data, textStatus, jqXHR) {
            for (var i in data) {
                Gw2traitsZH[data[i].id] = data[i]
            }
        },
        complete: function (jqXHR, textStatus) { }
    })
}

Gw2ItemstatsZH = {}
function SearchItemstatsV2(ids) {
    $.ajax({
        type: "GET",
        data: {
            ids: ids,
            lang: "zh",
        },
        url: "https://api.guildwars2.com/v2/itemstats",
        success: function (data, textStatus, jqXHR) {
            for (var i in data) {
                Gw2ItemstatsZH[data[i].id] = data[i]
            }
        },
        complete: function (jqXHR, textStatus) { }
    })
}

Gw2RecipesZH = {}
function SearchRecipesV2(ids) {
    $.ajax({
        type: "GET",
        data: {
            ids: ids,
            lang: "zh",
        },
        url: "https://api.guildwars2.com/v2/recipes",
        success: function (data, textStatus, jqXHR) {
            for (var i in data) {
                Gw2RecipesZH[data[i].id] = data[i]
            }
        },
        complete: function (jqXHR, textStatus) { }
    })
}

const Gw2Color = {
    Fine: "#62A4DA",
    Masterwork: "#1a9306",
    Rare: "#fcd00b",
    Exotic: "ffa405",
    Ascended: "#fb3e8d",
    Legendary: "#4C139D"
}

const Gw2Profession = {
    Guardian: "守护者",
    Warrior: "战士",
    Engineer: "工程师",
    Ranger: "游侠",
    Thief: "潜行者",
    Elementalist: "元素使",
    Mesmer: "幻术师",
    Necromancer: "唤灵师",
    Revenant: "魂武者"
}

const Gw2Weapon = {
    Axe: "斧",
    Focus: "聚能器",
    Greatsword: "大剑",
    Spear: "矛",
    Pistol: "手枪",
    Scepter: "权杖",
    Shield: "盾",
    Staff: "法杖",
    Sword: "单手剑",
    Torch: "火炬",
    Trident: "三叉戟",
    Dagger: "匕首",
    Hammer: "巨锤",
    Longbow: "长弓",
    Mace: "钉锤",
    Rifle: "步枪",
    Speargun: "鱼叉枪",
    Warhorn: "号角",
    Shortbow: "短弓"
}

const Gw2Attribute = {
    Power: "威力",
    Precision: "精准",
    Vitality: "体力",
    Toughness: "坚韧",
    ConditionDamage: "症状伤害",
    Healing: "治疗效果",
    CritDamage: "暴击效果",
    BoonDuration: "增益效果",
    ConditionDuration: "症状效果"
}

const Gw2Production = {
    Armorsmith: "盔甲锻造师",
    Artificer: "工艺制作师",
    Chef: "厨师",
    Huntsman: "猎手",
    Jeweler: "珠宝匠",
    Leatherworker: "皮革匠",
    Scribe: "抄写员",
    Tailor: "裁缝",
    Weaponsmith: "武器锻造师"
}
