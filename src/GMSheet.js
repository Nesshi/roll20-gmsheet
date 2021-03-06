/* global on log playerIsGM findObjs getObj getAttrByName sendChat globalconfig */ // eslint-disable-line no-unused-vars

/*
GMSheet %%version%%

A quick GM Cheatsheet for the D&D 5e OGL sheets on roll20.net.
Please use `!gmsheet` for inline help and examples.

arthurbauer@me.com
*/

on('ready', () => {
  const v = '%%version%%'; // version number
  const scname = 'GMSheet'; // script name
  log(`${scname} v${v} online. Select one or more party members, then use \`!gmsheet -h\``);
  let output = '';
  let collectedAttributes = '';
  let wantedAttributes;
  let columnjumper = 0;
  let myoutput = '';
  let resourceName = '';
  let otherresourceName = '';

  const resolveAttr = (cid, attname) => {
    const attobj = findObjs({
      type: 'attribute',
      characterid: cid,
      name: attname,
    }, { caseInsensitive: true })[0];
    if (!attobj) {
      return { name: '', current: '', max: '' };
    }
    const att2 = { name: attobj.get('name'), current: attobj.get('current'), max: attobj.get('max') };
    return att2;
  };


  const getCharMainAtt = (cid2) => {
    //! Main attributes
    output = '<table border=0><tr>';
    const cid = cid2.id;
    wantedAttributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    wantedAttributes.forEach((myAtt) => {
      collectedAttributes = resolveAttr(cid, myAtt);
      output += `<td><strong>${collectedAttributes.name.slice(0, 3).toUpperCase()}:</strong></td><td>&nbsp;${resolveAttr(cid, `${myAtt}_mod`).current > 0 ? `+${resolveAttr(cid, `${myAtt}_mod`).current}` : resolveAttr(cid, `${myAtt}_mod`).current}</td><td>&nbsp;<small>(${collectedAttributes.current})</small></td><td>&nbsp;&nbsp;</td>`;
      if (columnjumper === 1) {
        output += '</tr><tr>';
        columnjumper = 0;
      } else {
        columnjumper = 1;
      }
    });
    output += '</tr></table>';
    return output;
  };

  const getCharOtherAtt = (cid2) => {
    //! Other Attributes
    output = '';
    const cid = cid2.id;
    const hp = parseInt(resolveAttr(cid, 'hp').current, 10);
    const maxhp = parseInt(resolveAttr(cid, 'hp').max, 10);
    const hpdown = maxhp - hp;
    const hppercentage = Math.floor(((100 * hp) / maxhp) / 5) * 5;
    output = `<br><small><i>${resolveAttr(cid, 'race').current} Lvl ${resolveAttr(cid, 'level').current} ${resolveAttr(cid, 'class').current}</i></small>`;
    output += (resolveAttr(cid, 'inspiration').current === 'on' ? " <strong style='color:white;text-shadow: 2px 2px 4px #009000;' title='Character has inspiration!'>&#127775;</strong>" : '');
    output += `<br><br><strong>HP:</strong> ${hp}/${maxhp} `;
    output += (hp < maxhp ? ` <small style='color:#9d0a0e' title='down by ${hpdown} points, (${hppercentage}%) '>&#129301; ${hppercentage}% (-${hpdown} HP)</small> ` : '');
    output += (parseInt(resolveAttr(cid, 'hp_temp').current, 10) > 0 ? ` <span style='color:green'>+ ${resolveAttr(cid, 'hp_temp').current} TMP</span>` : '');
    output += `<br><strong>AC:</strong> ${resolveAttr(cid, 'ac').current}`;
    output += `<br><br>Speed: ${resolveAttr(cid, 'speed').current} ft, Passive Perception: ${resolveAttr(cid, 'passive_wisdom').current}<br>Initiative bonus: ${resolveAttr(cid, 'initiative_bonus').current > 0 ? `+${resolveAttr(cid, 'initiative_bonus').current}` : resolveAttr(cid, 'initiative_bonus').current}, Proficiency ${resolveAttr(cid, 'pb').current > 0 ? `+${resolveAttr(cid, 'pb').current}` : resolveAttr(cid, 'pb').current}`;
    output += '<br><br>';
    return output;
  };

  const getSpellSlots = (cid2) => {
    //! Spell slots
    output = '';
    const cid = cid2.id;

    output = '<br><b>Spell slots</b><br>';
    let i = 1;
    let spellLevelTotal = 0;
    let spellLevelEx = 0;
    let spellcount = 0;
    while (i < 10) {
      spellLevelTotal = resolveAttr(cid, `lvl${parseInt(i, 10)}_slots_total`).current;
      if (spellLevelTotal === 0 || spellLevelTotal === '') break;
      spellLevelEx = resolveAttr(cid, `lvl${parseInt(i, 10)}_slots_expended`).current;
      if (spellLevelTotal > 0) {
        spellcount += 1;
        if (spellLevelEx / spellLevelTotal <= 0.25) spellLevelEx = `<span style='color:red'>${spellLevelEx}</span>`;
        else if (spellLevelEx / spellLevelTotal <= 0.5) spellLevelEx = `<span style='color:orange'>${spellLevelEx}</span>`;
        else if (spellLevelEx / spellLevelTotal <= 0.75) spellLevelEx = `<span style='color:green'>${spellLevelEx}</span>`;
        else spellLevelEx = `<span style='color:blue'>${spellLevelEx}</span>`;
        output += `<b>Level ${i}:</b> ${spellLevelEx} / ${spellLevelTotal}<br>`;
      }
      i += 1;
    }
    if (spellcount < 1) output = '';

    //! class resources

    resourceName = resolveAttr(cid, 'class_resource_name').current;
    otherresourceName = resolveAttr(cid, 'other_resource_name').current;

    const classResourceTotal = resolveAttr(cid, 'class_resource').max;
    const classResourceCurrent = resolveAttr(cid, 'class_resource').current;
    const otherResourceTotal = resolveAttr(cid, 'other_resource').max;
    const otherResourceCurrent = resolveAttr(cid, 'other_resource').current;


    if (resourceName && classResourceTotal > 0) output += `<br>${resourceName}: ${classResourceCurrent}/${classResourceTotal}`;
    if (otherresourceName && otherResourceTotal > 0) output += `<br>${otherresourceName}: ${otherResourceCurrent}/${otherResourceTotal}`;
    resourceName = '';

    return output;
  };

  on('chat:message', (msg) => {
    if (msg.type !== 'api' && !playerIsGM(msg.playerid)) return;
    if (msg.content.startsWith('!gmsheet') !== true) return;
    if (msg.content.includes('-help') || msg.content.includes('-h')) {
      //! Help
      sendChat(scname, `/w gm %%README%%`); // eslint-disable-line quotes
    } else if (msg.selected == null) {
      sendChat(scname, '/w gm **ERROR:** You need to select at least one character.');

      /* will add a routine to save/load characters later */
    } else {
      msg.selected.forEach((obj) => {
        //! Output
        const token = getObj('graphic', obj._id); // eslint-disable-line no-underscore-dangle
        let character;
        if (token) {
          character = getObj('character', token.get('represents'));
        }
        if (character) {
          /* get the attributes and assemble the output */
          const charname = character.get('name');
          const charicon = character.get('avatar');
          if (myoutput.length > 0) myoutput += '<br>';
          myoutput += `<div style='display:inline-block; font-variant: small-caps; color:##9d0a0e; font-size:1.8em;margin-top:5px;'><img src='${charicon}' style='height:48px;width:auto;margin-right:5px;margin-bottom:0px;margin-top:5px; vertical-align:middle'>${charname}</div>${getCharOtherAtt(character)}${getCharMainAtt(character)}${getSpellSlots(character)}`;
        }
      });
      sendChat(scname, `/w gm <div style='border:1px solid black; background-color: #f9f7ec; padding:8px; border-radius: 6px; font-size:0.85em;line-height:0.95em;'>${myoutput}</div>`); // eslint-disable-line quotes
      myoutput = '';
    }
  });
});
