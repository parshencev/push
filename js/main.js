window.addEventListener("DOMContentLoaded", function(){
	this.app = new App();
	app.init();
});

function App(env){
	this.env = env ? env : Object({
		message_selector: ".form footer",
		button_selector: "#action",
		title_selector: "#title",
		icon_selector: "#icon",
		body_selector: "#body",
		sw_url: "./js/",
		sw_filename: "sw.js"
	});
	this.get_dom = function(type){
		switch(type){
			case 'message':
				return document.querySelector(this.env.message_selector);
			case 'action':
				return document.querySelector(this.env.button_selector);
			case 'title': 
				return document.querySelector(this.env.title_selector);
			case 'icon':
				return document.querySelector(this.env.icon_selector);
			case 'body':
				return document.querySelector(this.env.body_selector);
		}
		return false;
	};
	this.initServiceWorker = function(){
		this.serviceWorker.register(this.env.sw_filename, {scope: this.env.sw_url}).then((function(registration){
			this.registration = registration;
			this.message.innerHTML += "<br> сервис воркер зарегистрирован";
			this.initMethod();
		}).bind(this)).catch((function(err){
			this.registration = false;
			this.message.innerHTML += "<br> сервис воркер не зарегистрирован: " + err;
		}).bind(this));
	};
	this.initNotification = function(){
		this.notification.requestPermission((function(state){
			this.message.innerHTML += "<br> Ответ нотификации: " + state;
			if (state == "denied")
				this.state = false;
			else {
				this.state = true;
				this.initMethod();
			}
		}).bind(this));
	};
	this.notificationMethod = function(){
		var message = new this.notification(this.title.value, {
			body: this.body.value,
			icon: this.icon.value,
			onshow: function(data){
				alert(data)
			}
		});
	};
	this.serviceWorkerMethod = function(){
		this.registration.showNotification(this.title.value, {
			body: this.body.value,
			icon: this.icon.value
		})
	};
	this.initMethod = function(){
		this.method == "sw" ? 
			this.action.addEventListener("click", this.serviceWorkerMethod.bind(this)) : 
			this.action.addEventListener("click", this.notificationMethod.bind(this));
	};
	this.init = function(){
		this.message = this.get_dom("message");
		this.action = this.get_dom("action");
		this.title = this.get_dom("title");
		this.icon = this.get_dom("icon");
		this.body = this.get_dom("body");
		if (/Mobile/.test(window.navigator.userAgent)){
			this.message.innerHTML = "Мобильное";
			this.device = "mobile";
		}
		else {
			this.message.innerHTML = "не мобильное";
			this.device = "other";
		}
		if(!window.hasOwnProperty("Notification")){
			this.message.innerHTML += "<br> нотификации не поддерживаются";
			this.nt_check = false;
		} else {
			this.nt_check = true;
			this.notification = Notification || window.Notification;
		}
		if(!("serviceWorker" in navigator)){
			this.message.innerHTML += "<br> сервер воркер не поддерживается";
			this.sw_check = false;
		} else {
			this.sw_check = true;
			this.serviceWorker = navigator.serviceWorker;
		}
		if(!this.sw_check && !this.nt_check){
			this.work = false;
			this.message += "<br> пуш уведомление не отправить с этого браузера";
		} else {
			this.work = true;
		}
		if(this.device == "mobile" && this.work){
			this.method = "sw";
			this.message.innerHTML += "<br> выбран метод через сервер воркер";
		} else {
			this.method = "nt";
			this.message.innerHTML += "<br> выбран метод через нотификации";
		}
		if (this.method == "sw")
			this.initServiceWorker();
		else 
			this.initNotification();
	};
}
