import React, { Component } from 'react';
import { ATTRIBUTE, EQUIPMENTTYPE } from '../../lib/gw2/gwdhelper'
import { getItemstats } from '../../actions/gw2data'

class LegendSelectFunc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ItemStats: [],
      sel_attr: ATTRIBUTE[0].value,
      sel_stats: [],
      txt_target: 0,
    }

    this.initItemstats()
  }

  async initItemstats() {
    let itemstats = []
    let stats_name = []
    let res_itemstats = await getItemstats()
    res_itemstats.data.filter(item => {
      return item.attributes.length > 2 && item.name
    }).map(item => {
      if (!stats_name.includes(item.name)) {
        itemstats.push(item)
        stats_name.push(item.name)
      }
    })
    this.setState({ ItemStats: itemstats })
  }

  GetAllEquip(itemstats) {
    var result = []
    Object.keys(EQUIPMENTTYPE).forEach(item => {
      let equip = new Gw2Equipemnt(item)
      equip.get_attribute(itemstats.attributes, itemstats.name)
      result.push(equip)
    })

    // 2
    let equip2 = new Gw2Equipemnt('Onehanded')
    equip2.get_attribute(itemstats.attributes, itemstats.name)
    result.push(equip2)
    equip2 = new Gw2Equipemnt('Ring')
    equip2.get_attribute(itemstats.attributes, itemstats.name)
    result.push(equip2)
    equip2 = new Gw2Equipemnt('Accessory')
    equip2.get_attribute(itemstats.attributes, itemstats.name)
    result.push(equip2)

    return result
  }

  Calc(alist, blist) {
    let clist = alist.map((item, index) => {
      if (item.validity && blist[index].validity) {
        return [item, blist[index]]
      } else if (item.validity && !blist[index].validity) {
        return [item]
      } else if (!item.validity && blist[index].validity) {
        return [blist[index]]
      } else {
        return []
        alert('error')
      }
    })

    let arr_exists_attr = []
    let dlist = itertools_combinations(clist).filter(equipments => {
      let sum_attr = ATTRIBUTE.map(item => {
        return equipments.map(equipment => { return equipment.attributes[item.value] }).reduce((a, b) => a + b)
      })
      if (!arr_exists_attr.includes(sum_attr.join(''))) {
        arr_exists_attr.push(sum_attr.join(''))
        return true
      }
    })

    let result = dlist.sort((a, b) => {
      let a_attr = a.map(item => { return item.attributes[this.state.sel_attr] }).reduce((a, b) => a + b)
      let b_attr = b.map(item => { return item.attributes[this.state.sel_attr] }).reduce((a, b) => a + b)
      return Math.abs(a_attr - this.state.txt_target) - Math.abs(b_attr - this.state.txt_target)
    })

    return result.slice(0, 30)
  }

  render() {
    const handleClick = () => {
      if (this.state.txt_target == 0 || this.state.sel_stats.length != 2) {
        alert('error')
        return
      }
      let sel_itemstats = this.state.ItemStats.filter(item => { return this.state.sel_stats.includes(item.id + '') })
      let list_a = this.GetAllEquip(sel_itemstats[0])
      let list_b = this.GetAllEquip(sel_itemstats[1])
      let list_c = this.Calc(list_a, list_b)

      this.props.show_data(list_c)
    }

    const handleMulClick = (e) => {
      let idx = this.state.sel_stats.findIndex(item => {
        return item === e.target.value
      })
      if (idx >= 0) {
        this.state.sel_stats.splice(idx, 1);
      } else {
        this.state.sel_stats.push(e.target.value);
      }
      let sel_stats = this.state.sel_stats;
      this.setState({ sel_stats });
    }

    return (
      <div>
        <div style={{ float: 'left' }}>
          <select multiple readOnly value={this.state.sel_stats} onClick={handleMulClick} size={10}>
            {this.state.ItemStats.map(item => {
              return (<option key={item.id} value={item.id}>{item.name}</option>)
            })}
          </select>
        </div>
        <div>
          <select defaultValue={this.state.sel_attr} onChange={(e) => { this.setState({ sel_attr: e.target.value }) }} >
            {ATTRIBUTE.map(item => {
              return (<option key={item.value} value={item.value}>{item.label}</option>)
            })}
          </select>
          <br />
          <input type='text' onChange={(e) => { this.setState({ txt_target: e.target.value }) }} placeholder="输入预期数值" />
          <br />
          <br />
          <span>当前选择装备属性:</span>
          <br />
          <label>{this.state.sel_stats.map(stats_id => { return this.state.ItemStats.find(item => { return item.id == stats_id }).name }).join('\n')}</label>
          <br />
          <br />
          <br />
          <button onClick={handleClick}>计算</button>
        </div>
        <div style={{ clear: 'both' }}>
          <ul>
            <li>Critical Chance: Increases critical hit chance. At level 80, it has a base value of 5%, and is increased by Precision (21 Precision = 1% Critical Chance).</li>
            <li>Condition Duration: Increases the duration of all inflicted conditions. It has a base value of 0%, and is increased by Expertise (15 Expertise = 1% Condition Duration).</li>
            <li>Boon Duration: Increases the duration of all applied boons. It has a base value of 0%, and is increased by Concentration (15 Concentration = 1% Boon Duration).</li>
          </ul>
        </div>
      </div >
    )
  }
}

class Gw2AttrCalc extends Component {
  constructor(props) {
    super(props);
    equipments: []
  }

  render() {
    var equipments = JSON.parse(JSON.stringify(this.props.equipments))
    let l_div = []
    let mf_div = []
    let ms_div = []
    let r_li = []
    if (equipments.length != 0) {
      ATTRIBUTE.forEach(item => {
        r_li.push(<li key={item.value}>{item.label}:{equipments.map(equipment => { return equipment.attributes[item.value] }).reduce((a, b) => a + b)}</li>)
      })
      // const baojilv = equipments.map(item => { return item.attributes['Precision'] }).reduce((a, b) => a + b)/21
      r_li.push(<li key='baojilv'>暴击率:{Math.floor(equipments.map(item => { return item.attributes['Precision'] }).reduce((a, b) => a + b) / 21 * 100) / 100}%</li>)
      // const zhengzhuangchixushijian = equipments.map(item => { return item.attributes['ConditionDuration'] }).reduce((a, b) => a + b)/15
      r_li.push(<li key='zhengzhuangchixushijian'>症状持续时间:{Math.floor(equipments.map(item => { return item.attributes['ConditionDuration'] }).reduce((a, b) => a + b) / 15 * 100) / 100}%</li>)
      // const zengyichixushijian = equipments.map(item => { return item.attributes['BoonDuration'] }).reduce((a, b) => a + b)/15
      r_li.push(<li key='zengyichixushijian'>增益持续时间:{Math.floor(equipments.map(item => { return item.attributes['BoonDuration'] }).reduce((a, b) => a + b) / 15 * 100) / 100}%</li>)

      const l_tag = ['Head', 'Shoulders', 'Chest', 'Gloves', 'Legs', 'Boots', 'Onehanded', 'Onehanded']
      for (let i in l_tag) {
        let equipment = equipments.find(item => { return item.item_type == l_tag[i] })
        equipments.splice(equipments.indexOf(equipment), 1)
        l_div.push(<div key={'zb' + i} title={equipment.desc}>{equipment.item_name}</div>)
      }

      const rf_tag = ['Backitem', 'Accessory', 'Accessory']
      for (let i in rf_tag) {
        let equipment = equipments.find(item => { return item.item_type == rf_tag[i] })
        equipments.splice(equipments.indexOf(equipment), 1)
        mf_div.push(<div key={'ss' + i} title={equipment.desc} style={{ float: 'left', margin: '5px' }}> {equipment.item_name}</div >)
      }

      const rs_tag = ['Amulet', 'Ring', 'Ring']
      for (let i in rs_tag) {
        let equipment = equipments.find(item => { return item.item_type == rs_tag[i] })
        equipments.splice(equipments.indexOf(equipment), 1)
        ms_div.push(<div key={'ss' + i} title={equipment.desc} style={{ float: 'left', margin: '5px ' }}>{equipment.item_name}</div>)
      }
    }

    const ldiv_style = { width: '10%', float: 'left' }
    const mdiv_style = { width: '30%', float: 'left' }
    const msdiv_style = { clear: 'both' }
    return (
      <div>
        <div style={ldiv_style}>{l_div}</div>
        <div style={mdiv_style}>
          <div>{mf_div}</div>
          <br />
          <div style={msdiv_style}>{ms_div}</div>
        </div>
        <div style={mdiv_style}>
          <ul>{r_li}</ul>
        </div>
      </div >
    )
  }
}

export default class Gw2StatsFunc extends Component<*> {
  props: {
    equipments: Array,
  };

  state = {
    equipments: [],
    equipment: []
  }

  show_data(equipments) {
    this.setState({ equipments: equipments })
  }

  handleClick(e) {
    this.setState({ equipment: e })
  }

  render() {
    const list_btn_plan = []
    this.state.equipments.forEach((item, index) => {
      list_btn_plan.push(<button key={index} onClick={() => { this.handleClick(item) }}> 方案{index + 1}</button >)
    })
    return (
      <div>
        <div>
          <LegendSelectFunc show_data={(equipments) => { this.show_data(equipments) }} />
        </div>
        <div>{list_btn_plan}</div>
        <div>
          <Gw2AttrCalc equipments={this.state.equipment} />
        </div>
      </div>
    );
  }
}

class Gw2Equipemnt {
  EquipemntAttr = {
    Onehanded: { Major3: 125, Minor3: 90, Major4: 108, Minor4: 59, Major9: 59 },
    Chest: { Major3: 141, Minor3: 101, Major4: 121, Minor4: 67, Major9: 67 },
    Legs: { Major3: 94, Minor3: 67, Major4: 81, Minor4: 44, Major9: 44 },
    Head: { Major3: 63, Minor3: 45, Major4: 54, Minor4: 30, Major9: 30 },
    Shoulders: { Major3: 47, Minor3: 34, Major4: 40, Minor4: 22, Major9: 22 },
    Gloves: { Major3: 47, Minor3: 34, Major4: 40, Minor4: 22, Major9: 22 },
    Boots: { Major3: 47, Minor3: 34, Major4: 40, Minor4: 22, Major9: 22 },
    Amulet: { Major3: 157, Minor3: 108, Major4: 133, Minor4: 71, Major9: 72 },
    Ring: { Major3: 126, Minor3: 80, Major4: 106, Minor4: 56, Major9: 57 },
    Accessory: { Major3: 110, Minor3: 74, Major4: 92, Minor4: 49, Major9: 50 },
    Backitem: { Major3: 63, Minor3: 40, Major4: 52, Minor4: 27, Major9: 28 }
  }

  constructor(item_type) {
    this.item_name = "";
    this.item_type = item_type;
    this.max_count = 1;
    this.attributes = {}
    ATTRIBUTE.forEach(item => {
      this.attributes[item.value] = 0
    })
    this.desc = ""
    this.validity = true
  }

  get_attribute(attributes, item_name = "unknown") {
    this.item_name = item_name;
    const eq_attr = this.EquipemntAttr[this.item_type]
    const sum_mulit = attributes.map(item => { return item.multiplier })
    const sum_mulit_0 = sum_mulit.filter(item => { if (item != 0) return item })
    const av_mulit = sum_mulit_0.reduce((a, b) => a + b) / sum_mulit_0.length
    if (attributes.length == 3) {
      attributes.forEach(item => {
        if (item.multiplier >= av_mulit) {
          this.attributes[item.attribute] = eq_attr.Major3
        } else {
          this.attributes[item.attribute] = eq_attr.Minor3
        }
      })
    } else if (attributes.length == 4 && sum_mulit_0.length == 4) {
      attributes.forEach(item => {
        if (item.multiplier >= av_mulit) {
          this.attributes[item.attribute] = eq_attr.Major4
        } else {
          this.attributes[item.attribute] = eq_attr.Minor4
        }
      })
    } else if (attributes.length == 4 && sum_mulit_0.length == 3) {
      if (this.item_type == "Backitem" || this.item_type == "Accessory" || this.item_type == "Amulet" || this.item_type == "Ring") {
        let attr_1 = attributes.find(item => { return item.multiplier == 0 && item.value != 0 })
        let attr_2 = attributes.find(item => { return item.multiplier < av_mulit && item.value == 0 })
        let attr_3 = attributes.find(item => { return item.multiplier < av_mulit && item.multiplier > 0 && item.value != 0 })
        let attr_4 = attributes.find(item => { return item.multiplier > av_mulit })
        this.attributes[attr_1.attribute] = attr_1.value
        this.attributes[attr_2.attribute] = eq_attr.Minor3 - 18
        this.attributes[attr_3.attribute] = eq_attr.Minor3
        this.attributes[attr_4.attribute] = eq_attr.Major3 + 18 - attr_1.value
      } else {
        this.validity = false
      }
    } else if (attributes.length == 9) {
      ATTRIBUTE.forEach(item => {
        this.attributes[item.value] = eq_attr.Major9
      })
    }

    this.get_title_txt()
  }

  get_title_txt() {
    var txt_title = "部位:" + EQUIPMENTTYPE[this.item_type] + "\n"
    var valid_attributes = []
    Object.keys(this.attributes).forEach(key => {
      if (this.attributes[key] != 0) {
        let attr_name = ATTRIBUTE.find(item => { return item.value == key }).label
        valid_attributes.push(attr_name + ":" + this.attributes[key])
      }
    })
    txt_title += valid_attributes.join('\n')
    this.desc = txt_title
  }

}

function itertools_combinations(doubleList = []) {
  if (doubleList.length == 0) return [];//先return掉空的

  const result = [];//最终组合集
  /**
  * doubleList 二维数组 Array
  * index 当前所在步骤
  * currentList 当前累积维度的数组
  */
  const _back = (doubleList, index, currentList) => {
    //判断是否到了最底层
    if (index >= doubleList.length) {
      result.push([...currentList]);
    } else {
      //循环递归
      doubleList[index].forEach(item => {
        //累加当前数组
        currentList.push(item);
        //递归
        _back(doubleList, index + 1, currentList)
        currentList.pop();
      });
    }
  }
  _back(doubleList, 0, []);
  return result;
}