(function(){
  "use strict";

  var Moosipurk = function(){
    // SINGLETON PATTERN (4 rida)
    if(Moosipurk.instance){
      return Moosipurk.instance;
    }
    Moosipurk.instance = this; //this viitab moosipurgile

    this.routes = Moosipurk.routes;

    //console.log(this);
    //console.log('moosipurgi sees');

    //Kõik muutujad, mis on üldised ja muudetavad
    this.currentRoute = null; // hoiab meeles mis lehel hetkel on
    this.interval = null;
    this.jars = []; //kõik purgid tulevad siia sisse

    //panen rakenduse tööle
    this.init();
  };

  //kirjeldatud kõik lehed
  Moosipurk.routes = {
    "home-view" : {
      render: function(){
        // käivitan siis kui jõuan lehele
        console.log('JS avalehel');
        if(this.interval){clearInterval(this.interval);}
        var seconds = 0;
        this.interval = window.setInterval(function(){
          seconds++;
          document.querySelector('#counter').innerHTML = seconds;
        }, 1000);
      }
    },
    "list-view" : {
      render: function(){
        console.log('JS loend lehel');
      }
    },
    "manage-view" : {
      render: function(){
        //console.log('JS haldus lehel');
      }
    }
  };

  //kõik moosipurgi funktsioonid siia sisse
  Moosipurk.prototype = {
    init: function(){
      //console.log('rakendus käivitus');
      //Esialgne loogika tuleb siia
      window.addEventListener('hashchange', this.routeChange.bind(this));
      //vaatan mis lehel olen
      //console.log(window.location.hash);
      if(!window.location.hash){
        window.location.hash = "home-view";
      }else{
        //hash oli olemas
        this.routeChange();
      }
      //saan kätte purgid localStorage kui on
      if(localStorage.jars){
        //string tagasi objektiks
        this.jars = JSON.parse(localStorage.jars);
        //tekitan loendi htmli
        this.jars.forEach(function(jar){
            var new_jar = new Jar(jar.title, jar.ingredients, jar.timeAdded);
            var li = new_jar.createHtmlElement();
            document.querySelector('.list-of-jars').appendChild(li);
        });
      }

      //hakka kuulama hiireklõpse
      this.bindEvents();
    },
    bindEvents: function(){
      document.querySelector('.add-new-jar').addEventListener('click', this.addNewClick.bind(this));
      //kuulan trükkimist otsi kastist
      document.querySelector('#search').addEventListener('keyup', this.search.bind(this));
    },
    search: function(event){
      var kokku=0;
      //otsikasti väärtus
      var needle = document.querySelector('#search').value.toLowerCase();
      //console.log(needle);
      var list = document.querySelectorAll('ul.list-of-jars li');
      //console.log(list);
      for(var i=0; i<list.length; i++){
        var li = list[i];
          //ühe list itemi sisu
          var stack = li.querySelector('.content').innerHTML.toLowerCase();
          //kas otsisõna on olemas
          if(stack.indexOf(needle) !== -1){
            //olemas
            li.style.display = 'list-item';
            //this.kokku=list.length;
          }else{
            //ei ole olemas
            li.style.display = 'none';
          }
          if(li.style.display == 'list-item'){kokku++;}
          document.querySelector('#kokku').innerHTML='Kokku: '+kokku;
      }
    },
    addNewClick: function(event){
      //lisa uus purk
      var title = this.trimWord(document.querySelector('.title').value);
      var ingredients = this.trimWord(document.querySelector('.ingredients').value);
	    var timeAdded = this.writeDate();
      //console.log(title+' '+ingredients+' Lisatud: '+timeAdded);
	    var className = document.getElementById("show-feedback").className;
      //lisan masiivi purgid


      if(title === '' || ingredients === ''){
  		    if(className == "feedback-success"){
  		        document.querySelector('.feedback-success').className=document.querySelector('.feedback-success').className.replace('feedback-success','feedback-error');
  		    }
          document.querySelector('#show-feedback').innerHTML='Kõik read peavad täidetud olema';
      }else{
        if(className == "feedback-error"){
          document.querySelector('.feedback-error').className=document.querySelector('.feedback-error').className.replace('feedback-error','feedback-success');
        }
        document.querySelector('#show-feedback').innerHTML='Salvestamine õnnestus';
  		  var new_jar = new Jar(title, ingredients, timeAdded);
        //lisan massiivi moosipurgi
        this.jars.push(new_jar);
        console.log(JSON.stringify(this.jars));
        //JSON'i stringina salvestan local storagisse
        localStorage.setItem('jars', JSON.stringify(this.jars));
        document.querySelector('.list-of-jars').appendChild(new_jar.createHtmlElement());
      }
    },
    routeChange: function(event){
      this.currentRoute = window.location.hash.slice(1);
      //kas leht on olemas
      if(this.routes[this.currentRoute]){
        //jah olemas
        this.updateMenu();
        //console.log('>>> '+this.currentRoute);
        //käivitan selle lehe jaoks ettenähtud js
        this.routes[this.currentRoute].render();
      }else{
        //404? ei ole
        console.log('404');
        window.location.hash = 'home-view';
      }
    },
    updateMenu: function(){
      //kui menüül on active-menu siis võtame ära
      document.querySelector('.active-menu').className=document.querySelector('.active-menu').className.replace(' active-menu', '');
      //käesolevale lehele lisan juurde
      document.querySelector('.'+this.currentRoute).className+=' active-menu';
    },
	writeDate : function(){
		  var d = new Date();
		  var day = d.getDate();
		  var month = d.getMonth();
		  var year = d.getFullYear();
		  //#clock element htmli
		  var curTime = this.addZeroBefore(day)+"."+this.addZeroBefore(month+1)+"."+year;
		  return curTime;
	},
	addZeroBefore : function(number){
		  if(number<10){
			number="0"+number;
		  }
		  return number;
	},
    trimWord: function (str) {
    str = str.replace(/^\s+/, '');
    for (var i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return str;
}
  };

  var Jar = function(title, new_ingredients, timeAdded){
    this.title = title;
    this.ingredients = new_ingredients;
	this.timeAdded = timeAdded;
  };
  Jar.prototype = {
    createHtmlElement: function(){
      //anna tagasi ilus html
      var li = document.createElement('li');

      var span = document.createElement('span');
      span.className = 'letter';
      var letter = document.createTextNode(this.title.charAt(0));
      span.appendChild(letter);
      li.appendChild(span);

      var content_span = document.createElement('span');
      content_span.className = 'content';
      var content = document.createTextNode(this.title+' | '+this.ingredients+' Kuupäev: '+this.timeAdded);
      content_span.appendChild(content);
      li.appendChild(content_span);

      //console.log(li);
      return li;
    }
  };

  window.onload = function(){
    var app = new Moosipurk();
  };

})();
