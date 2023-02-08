import React, { Component } from 'react';
import Gw2Specialization from '../../components/Gw2Specialization'
import Gw2Skill from '../../components/Gw2Skill'
import LanguageProvider from '../../components/LanguageProvider';
import { PROFESSION, WEAPON, getSkillsByProfession, Gw2ProfessionMechanic, getFlipskillByIds } from '../../lib/gw2/gwdhelper'
import { getSkillsByIds, getSecializationsByIds } from '../../actions/gw2data'

class ProfessionFunc extends Component {
  constructor(props) {
    super(props);
  }
  handleClick(profession) {
    this.props.show_data(profession)
  }
  render() {
    const list_btn_prof = []
    const btn_style = {
      marginRight: '20px',
    }
    PROFESSION.map(pro =>
      list_btn_prof.push(<button key={pro.value} style={btn_style} onClick={() => this.handleClick(pro.value)}> {pro.label}</button >)
    )

    return (
      <div>{list_btn_prof}</div>
    )
  }
}

class Gw2WeaponFunc extends Component {
  constructor(props) {
    super(props);
    weapon_skills: { }
  }
  render() {
    var list_div = []
    Object.keys(this.props.weapon_skills).map(key => {
      let skills = this.props.weapon_skills[key].skills;
      list_div.push(<span key={key}>{WEAPON[key]}</span>)
      list_div.push(<br />)
      // 元素
      if (skills[0].hasOwnProperty('attunement')) {
        let attr_skills = {};
        skills.map(skill => {
          if (attr_skills.hasOwnProperty(skill.attunement)) {
            attr_skills[skill.attunement].push(skill);
          } else {
            attr_skills[skill.attunement] = [skill];
          }
        })
        Object.keys(attr_skills).map(key => {
          list_div.push(
            <SkillBar skills={attr_skills[key]} />
          )
        })
      }
      else {
        list_div.push(
          <SkillBar skills={skills} />
        )
      }
    })
    list_div = [<div key="weapons"> {list_div}</div >]
    return list_div
  }
}

class Gw2SkillFunc extends Component {
  constructor(props) {
    super(props);
    skills: []
  }
  render() {
    // console.log('组件更新', this.props.skills)
    var skills = {}
    this.props.skills.map(skill => {
      // if (skill.type == Profession) { continue }
      if (skills.hasOwnProperty(skill.slot)) {
        skills[skill.slot].push(skill.id)
      } else {
        skills[skill.slot] = [skill.id]
      }
    })
    var list_div = []
    Object.keys(skills).map(key => {
      let list_skill = [<div key={key}><span key={key}>{key}</span></div>]
      skills[key].map(skill => {
        list_skill.push(<Gw2Skill id={skill} key={skill} />)
      })
      list_div.push(<div key={key}>{list_skill}</div>)
    })
    // console.log('组件更新', skills)
    return list_div
  }
}

class Gw2SpeFunc extends Component {
  constructor(props) {
    super(props);
    ids: []
  }
  render() {
    var list_spe = []
    this.props.ids.map(id =>
      list_spe.push(<Gw2Specialization id={id} key={id} />)
    )
    return list_spe
  }
}

export default class Gw2protrain extends Component<*> {
  props: {
    profession: String,
  };

  state = {
    specialization_ids: [],
    weapons: {},
    skills: [],
  }

  async show_data(profession) {
    this.setState({ weapons: [], skills: [], specialization_ids: [] })
    const professinfo_info = await getSkillsByProfession(profession)
    // console.log('职业信息', professinfo_info.data)

    let specialization_ids = professinfo_info.data.specializations.map(id => { return id })
    let res_spec = await getSecializationsByIds(specialization_ids.join(','))
    let skills = professinfo_info.data.skills.filter(skill => { return skill.type == 'Heal' || skill.type == 'Elite' })
    // 职业技能
    let res_profession_skill = await getSkillsByIds(professinfo_info.data.skills.map(skill => { if (skill.type == 'Profession') { return skill.id } }).join(','))
    let profession_skills = res_profession_skill.data.sort((a, b) => {
      return a.slot.replace(/[^\d]/g, '') - b.slot.replace(/[^\d]/g, '');
    })
    profession_skills.map(skill => {
      let skill_slot = skill.categories || skill.type
      if (skill.specialization != undefined) {
        skill_slot = res_spec.data.filter(item => { return item.id == skill.specialization })[0].name
      }
      skills.push({ id: skill.id, slot: skill_slot, type: skill.type })
    })
    // 通用技能
    professinfo_info.data.training.map(train => {
      if (train.category == 'Skills') {
        train.track.map(tr => {
          if (tr.type == 'Skill') {
            skills.push({ id: tr.skill_id, slot: train.name, type: 'Utility' })
          }
        })
      } else if (train.category == "EliteSpecializations") {
        return train.track.map(tr => {
          if (tr.type == 'Skill') {
            skills.push({ id: tr.skill_id, slot: train.name + ' 插槽', type: 'Utility' })
          }
        })
      }
    })
    //变身技能
    let skill_ids = skills.map(skill => { return skill.id })
    let res_skills = await getSkillsByIds(skill_ids.join(','))
    for (let i in res_skills.data) {
      let skill_info = res_skills.data[i]
      let bundle_skills = skill_info.bundle_skills || skill_info.transform_skills;
      if (bundle_skills != undefined && bundle_skills.length != 0) {
        bundle_skills.map(skill_id => {
          skills.push({ id: skill_id, slot: skill_info.name, type: 'Bundle' })
        })
      }
      // 工程
      if (skill_info.toolbelt_skill != undefined) {
        skills.push({ id: skill_info.toolbelt_skill, slot: 'toolbelt', type: 'Profession' })
      }
    }
    // UnknownSkill
    let unknown_skills = Gw2ProfessionMechanic.filter(skill => { return skill.profession == profession })
      .sort((a, b) => {
        return a.slot - b.slot;
      })
    unknown_skills.map(skill => {
      skills.push({ id: skill.id, slot: skill.bundle, type: 'Transform' })
    })
    this.setState({ weapons: professinfo_info.data.weapons, skills: skills, specialization_ids: specialization_ids })
  }

  render() {
    const ldiv_style = { width: '33%', float: 'left' }
    const rdiv_style = { width: '33%', float: 'right' }
    const bdiv_style = { clear: 'both' }
    return (
      <div>
        < ProfessionFunc show_data={(profession) => { this.show_data(profession) }} />
        <div>
          <div style={ldiv_style}><Gw2WeaponFunc weapon_skills={this.state.weapons} /></div>
          <div style={ldiv_style}><Gw2SkillFunc skills={this.state.skills} /></div>
          <div style={rdiv_style}><Gw2SpeFunc ids={this.state.specialization_ids} /></div>
        </div >
      </div >
    );
  }
}

class SkillBar extends Component {
  constructor(props) {
    super(props);
    this.state = { bar_skills: [] }
  }

  props: {
    skills: [],
  }

  async componentDidMount() {
    var list_skill = []
    let skill_ids = this.props.skills.map(skill => { return skill.id })
    let res_flip = await getFlipskillByIds(skill_ids.join(','))
    let related_skill = res_flip.filter(skill => { return !skill_ids.includes(skill.id) })
    let basic_skill = skill_ids.map(id => { return <Gw2Skill id={id} key={id} /> })

    let list_flip_skill = this.queryFlipSkills(res_flip.filter(skill => { return skill_ids.includes(skill.id) }), related_skill, 1)
    let list_next_skill = this.queryFlipSkills(res_flip.filter(skill => { return skill_ids.includes(skill.id) }), related_skill)

    list_skill.unshift(list_flip_skill)
    list_skill.push(basic_skill)
    list_skill.push(list_next_skill)
    this.setState({ bar_skills: list_skill })
  }


  queryFlipSkills(bSkill, aSkill, skill_type = 0, skill_count) {
    const skillTypes = ['next_chain', 'flip_skill']
    var has_skills = []
    var list_skill = []
    var count = skill_count || bSkill.length
    for (let i = 0; i < count; i++) {
      list_skill.push(<Gw2Skill />)
    }
    for (let i in bSkill) {
      let skill_id = bSkill[i][skillTypes[skill_type]]
      if (skill_id) {
        list_skill[i] = <Gw2Skill id={skill_id} key={skill_id} />
        has_skills.push(aSkill.filter(skill => { return skill.id == skill_id })[0])
      }
    }
    if (skill_type == 0) {
      list_skill.unshift(<br />)
    } else {
      list_skill.push(<br />)
    }
    if (has_skills.length > 0 && skill_type == 0) {
      list_skill = list_skill.concat(this.queryFlipSkills(has_skills, aSkill, skill_type, count))
    } else if (has_skills.length == 0) {
      list_skill = []
    }
    return list_skill
  }

  render() {
    return (
      <div>{this.state.bar_skills}</div>
    )
  }
}