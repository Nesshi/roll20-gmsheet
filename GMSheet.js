/* global on log playerIsGM findObjs getObj getAttrByName sendChat globalconfig */

/*
GMSheet %%version%%

A quick GM Cheatsheet for the D&D 5e OGL sheets on roll20.net.
Please use `!gmsheet` for inline help and examples.



arthurbauer@me.com
*/


on('ready',() => {

  const v = '%%version%%'; // version number
  const scname = 'GMSheet'; // script name
  let selectedsheet = 'OGL'; // You can set this to "5E-Shaped" if you're using the Shaped sheet

  var output = "";
  var collectedAttributes = "";
  let wantedAttributes ;
  var columnjumper = 0;
  
  const resolveAttr = (cid,name) => ({
    name: name,
    current: getAttrByName(cid,name),
    max: getAttrByName(cid,name,'max')
  });
   
  
  const getCharMainAtt = (cid) => {
    output = "<table border=0><tr>";
    cid = cid["id"];
    wantedAttributes=["strength","dexterity","constitution","intelligence","wisdom","charisma"]
    wantedAttributes.forEach((myAtt)=> {

      collectedAttributes =  resolveAttr(cid,myAtt);

      output += "<td><strong>"+collectedAttributes['name'].slice(0,3).toUpperCase()+":</strong></td><td>"+(resolveAttr(cid,myAtt+"_mod")['current']>0?"+"+resolveAttr(cid,myAtt+"_mod")['current']:resolveAttr(cid,myAtt+"_mod")['current'])+"</td><td><small>("+collectedAttributes['current']+")</small></td><td>&nbsp;</td>";

      if (columnjumper == 1) {
       output += "</tr><tr>";
       columnjumper=0;       
      }
      else {
        columnjumper=1;
      }

    });
    output += "</tr></table>";
    return output;
  };
  

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


  const getCharOtherAtt = (cid) => {

    output = "";
    cid = cid["id"];
    
    output = "<br>"+resolveAttr(cid,"race")['current']+" Lvl "+resolveAttr(cid,"level")['current']+" "+resolveAttr(cid,"class")['current'];
    output += "<br>Inspiration: "+(resolveAttr(cid,"inspiration")['current']=="on"?"<strong style='color:white;text-shadow: 2px 2px 4px #009000;'>Yes</strong>":"no");
    output += "<br>HP: "+resolveAttr(cid,"hp")['current']+"/"+resolveAttr(cid,"hp")['max']+" ";
    output += (resolveAttr(cid,"hp")['current'] < resolveAttr(cid,"hp")['max']?" <small style='color:red'>down by "+(resolveAttr(cid,"hp")['max']-resolveAttr(cid,"hp")['current'])+ "</small> ":"");   
    output += (resolveAttr(cid,"hp_temp")['current'] > 0?" + "+resolveAttr(cid,"hp_temp")['current']+ " TMP":"");
    output += "<br>AC: "+resolveAttr(cid,"ac")['current']+", Initiative bonus: "+(resolveAttr(cid,"initiative_bonus")['current']>0?"+"+resolveAttr(cid,"initiative_bonus")['current']:resolveAttr(cid,"initiative_bonus")['current']);
    output += "<br>Speed: "+resolveAttr(cid,"speed")['current']+" ft, passive perception: "+resolveAttr(cid,"passive_wisdom")['current'];

    return output;
  };
  


on('chat:message', (msg) => {
    if (msg.type !== 'api' && !playerIsGM(msg.playerid)) return;
    if (msg.content.startsWith('!gmsheet') !== true) return;
    if (msg.selected == null) {
      sendChat(scname, '/w gm **ERROR:** You need to select at least one character.');
      
      /* will add a routine to save/load characters later */
      
      return;
    }


    if (msg.content.includes('-help') || msg.content.includes('-h')) {
      //! help
      sendChat(scname, `/w gm %%README%%`); // eslint-disable-line quotes
    }
    
    else
    {
  
      const partymember = Object.entries(msg.selected).length;
      msg.selected.forEach((obj) => {
        const token = getObj('graphic', obj._id); // eslint-disable-line no-underscore-dangle
        let character;
        if (token) {
          character = getObj('character', token.get('represents'));
        }
        if (character) {
  
      /* get the attributes and assemble the output */
        let myoutput;
        log (character);
        myoutput = character["bio"] + getCharOtherAtt(character) + getCharMainAtt(character);
        sendChat(scname, `/w gm `+ myoutput); // eslint-disable-line quotes
        }
      });
    }
  });
});