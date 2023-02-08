const cheerio = require('cheerio');

const wiki_url = "http://en.gw2skills.net/wiki/"
// const Gw2ProfessionMechanics = {
//     Guardian: ["Tome"],
//     Warrior: ["Gunsaber", "Dragon_Slash"],
//     Engineer: ["Mech_Command"],
//     // Ranger: "游侠",
//     Thief: ["Shadow_Shroud"],
//     // Elementalist: "元素使",
//     // Mesmer: "幻术师",
//     // Necromancer: "唤灵师",
//     // Revenant: "魂武者"
// }
const Gw2ProfessionMechanics = [
    "Tome",
    "Gunsaber", "Dragon_Slash", "Mech_Command", "Shadow_Shroud", "Photon Forge"
]

class Fact {
    icon = "";
    text = "";
    type = "NoData";
}

class Skill {
    id = 0;
    profession = "";
    name = "";
    chat_link = "";
    description = "";
    facts = [];
    icon = "";
    recharge = "0";
    slot = 1;
    bundle = "";
    wiki_url = "https://wiki.guildwars2.com";

    make_str() {
        var result = `{icon:"https://wiki.guildwars2.com/images/f/f4/Tango-recharge-darker.png", text:"Recharge", type:"Recharge", value:"${this.recharge}"}`
        for (let i in this.facts) {
            let fact = this.facts[i]
            result += `,{icon:"${fact.icon}", text:"${fact.text}", type:"${fact.type}"}`
        }
        return result
    }

    output() {
        return `{id:${this.id},profession:"${this.profession}",name:"${this.name}",chat_link:"${this.chat_link}",description:"${this.description}",icon:"${this.icon}",slot:"${this.slot}",bundle:"${this.bundle}",facts:[${this.make_str()}]},\n`
    }
};
count = 0
skills = []

async function queryProfessionMechanic() {
    for (let item in Gw2ProfessionMechanics) {
        const resp = await fetch('https://wiki.guildwars2.com/wiki/' + Gw2ProfessionMechanics[item])
        var $ = cheerio.load(await resp.text());
        let tableList = $('table.skills.table')
        for (let i = 0; i < tableList.length; i++) {
            let trList = tableList.eq(i).find('tr')
            for (let j = 0; j < trList.length; j++) {
                let key_word = trList.eq(j).find('span span').find('a').first().attr('href');
                if (key_word != undefined) {
                    let slot = trList.eq(j).find('td:eq(0)').text().trim();
                    let recharge = trList.eq(j).find('td:eq(3)').text().trim();
                    var skill = new Skill();
                    skill.slot = slot;
                    skill.recharge = recharge || "0";
                    skill.wiki_url = 'https://wiki.guildwars2.com/' + key_word
                    skills.push(skill)
                    count++
                }
            }
        }
    }
}

function querySkillId() {
    for (i = 0; i < skills.length; i++) {
        let skill = skills[i]
        fetch(skill.wiki_url).then(async resp => {
            var $ = cheerio.load(await resp.text());
            skill.id = $('div.wrapper dd span.gamelink').attr('title')
            skill.profession = $('div.wrapper dd:first').find('a').attr('title')
            skill.name = $('#firstHeading').text()
            skill.chat_link = encodeChatLink('skill', skill.id)
            skill.description = $('blockquote p').text().split('\n')[0]
            let icon_src = $('div.infobox.skill img:first').attr('src')
            skill.icon = 'https://wiki.guildwars2.com/images' + icon_src.slice(icon_src.indexOf('thumb') + 5, icon_src.lastIndexOf('/'))
            skill.bundle = $('div.wrapper a[title="Bundle"]').parent().next().text() || $('div.wrapper dd:eq(2)').find('a').text()
            let ddList = $('blockquote dd')
            for (let i = 0; i < ddList.length; i++) {
                var fact = new Fact()
                let icon_src = ddList.eq(i).find('img').attr('src')
                fact.icon = 'https://wiki.guildwars2.com/images' + icon_src.slice(icon_src.indexOf('thumb') + 5, icon_src.lastIndexOf('/'))
                fact.text = ddList.eq(i).text()
                skill.facts.push(fact)
            }
            process.stdout.write(skill.output())
        })
    }
}

function encodeChatLink(type, id) {
    var linkTypes = { item: 2, text: 3, map: 4, skill: 6, trait: 7, recipe: 9, skin: 10, outfit: 11 };
    if (!type) {
        return 'invalid type';
    }
    type = linkTypes[type.trim().toLowerCase()] || 0;
    if (!type) {
        return 'invalid type';
    }

    var data = [];
    while (id > 0) {
        data.push(id & 255);
        id = id >> 8;
    }
    while (data.length < 4 || data.length % 2 != 0) {
        data.push(0);
    }

    if (type == 2) {
        data.unshift(1);
    }
    data.unshift(type);

    // encode data
    var binary = '';
    for (var i = 0; i < data.length; i++) {
        binary += String.fromCharCode(data[i]);
    }
    return '[&' + btoa(binary) + ']';
}

async function work() {
    await queryProfessionMechanic()
    querySkillId()
}

work()
