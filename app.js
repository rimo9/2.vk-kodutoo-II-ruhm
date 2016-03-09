(function(){
  "use strict";

  var Raamat = function(){
    // SINGLETON PATTERN (4 rida)
    if(Raamat.instance){
      return Raamat.instance;
    }
    Raamat.instance = this; //this viitab raamatule

    this.routes = Raamat.routes;

    //console.log(this);

    //Kõik muutujad, mis on üldised ja muudetavad
    this.currentRoute = null; // hoiab meeles mis lehel hetkel on
    this.books = []; //kõik tulevad siia sisse

    //panen rakenduse tööle
    this.init();
  };

  //window.Raamat = Raamat;

  //kirjeldatud kõik lehed
  Raamat.routes = {
    "home-view" : {
      render: function(){
        //console.log('JS avalehel');
      }
    },
    "list-view" : {
      render: function(){
      //console.log('JS loend lehel');
      }
    },
    "manage-view" : {
      render: function(){
        //console.log('JS haldus lehel');
      }
    }
  };

  //kõik funktsioonid siia sisse
  Raamat.prototype = {
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
      if(localStorage.books){
        //string tagasi objektiks
        this.books = JSON.parse(localStorage.books);
        //tekitan loendi htmli
        this.books.forEach(function(book){
            var new_book = new Book(book.id, book.BookAuthor, book.BookName, book.timeAdded);
            var li = new_book.createHtmlElement();
            document.querySelector('.list-of-books').appendChild(li);
        });
      }

      //hakka kuulama hiireklõpse
      this.bindEvents();
    },
    bindEvents: function(){
      document.querySelector('.add-new-book').addEventListener('click', this.addNewClick.bind(this));
      //kuulan trükkimist otsi kastist
      document.querySelector('#search').addEventListener('keyup', this.search.bind(this));
    },
    delete: function(event){

      var conf = confirm('Are you sure?');
      if(!conf){return;}
      var ul = event.target.parentNode.parentNode;
      var li = event.target.parentNode;
      ul.removeChild(li);

      for(var i=0; i<this.books.length; i++){
        if(this.books[i].id == event.target.dataset.id){
          //kustuta kohal i objekt ära
          this.books.splice(i, 1);
          //ei lähe edasi
          break;
        }
      }
      localStorage.setItem('books', JSON.stringify(this.books));
    },
    search: function(event){
      var kokku=0;
      //otsikasti väärtus
      var needle = document.querySelector('#search').value.toLowerCase();
      //console.log(needle);
      var list = document.querySelectorAll('ul.list-of-books li');
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
      var BookAuthor = this.trimWord(document.querySelector('.BookAuthor').value);
      var BookName = this.trimWord(document.querySelector('.BookName').value);
	    var timeAdded = this.writeDate();

      //console.log(BookAuthor+' '+BookName+' Lisatud: '+timeAdded);
	    var className = document.getElementById("show-feedback").className;
      //lisan masiivi purgid


      if(BookAuthor === '' || BookName === ''){
  		    if(className == "feedback-success"){
  		        document.querySelector('.feedback-success').className=document.querySelector('.feedback-success').className.replace('feedback-success','feedback-error');
  		    }
          document.querySelector('#show-feedback').innerHTML='Kõik read peavad täidetud olema';
      }else{
        if(className == "feedback-error"){
          document.querySelector('.feedback-error').className=document.querySelector('.feedback-error').className.replace('feedback-error','feedback-success');
        }
        document.querySelector('#show-feedback').innerHTML='Salvestamine õnnestus';
  		  var new_book = new Book(guid(), BookAuthor, BookName, timeAdded);
        //lisan massiivi moosipurgi
        this.books.push(new_book);
        //console.log(JSON.stringify(this.books));
        //JSON'i stringina salvestan local storagisse
        localStorage.setItem('books', JSON.stringify(this.books));
        document.querySelector('.list-of-books').appendChild(new_book.createHtmlElement());
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
        //console.log('404');
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

  var Book = function(new_id, BookAuthor, new_BookName, timeAdded){
    this.id = new_id;
    this.BookAuthor = BookAuthor;
    this.BookName = new_BookName;
	  this.timeAdded = timeAdded;
  };
  Book.prototype = {
    createHtmlElement: function(){

      //anna tagasi ilus html
      var li = document.createElement('li');
      var span = document.createElement('span');
      span.className = 'letter';
      var letter = document.createTextNode(this.BookAuthor.charAt(0));
      span.appendChild(letter);
      li.appendChild(span);

      var content_span = document.createElement('span');
      content_span.className = 'content';
      var content = document.createTextNode(this.BookAuthor+' | '+this.BookName+' Lisatud: '+this.timeAdded+' ');
      content_span.appendChild(content);
      li.appendChild(content_span);

      var delete_span = document.createElement('button');
      delete_span.setAttribute('data-id', this.id);
      delete_span.innerHTML = "Kustuta";
      li.appendChild(delete_span);

      delete_span.addEventListener('click', Raamat.instance.delete.bind(Raamat.instance));

      //console.log(li);
      return li;
    }
  };

  //helper
  function guid(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  }

  window.onload = function(){
    var app = new Raamat();
  };

})();
