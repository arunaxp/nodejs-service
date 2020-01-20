(function () {    
    var socket = io();
    var Message;
    const notiTypes = {
        SUCCESS: 'alert-success',
        DANGER: 'alert-danger',
        WARNING: 'alert-warning',
        INFO: 'alert-info'
    }
    Message = function (arg) {
        this.text = arg.text, 
        this.username = arg.username,
        this.message_side = arg.message_side;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $message.find('.avatar_text').html(_this.username.charAt(0).toUpperCase());
                $('.messages').append($message);
                console.log($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };
    $(function () {
        var getMessageText, message_side, sendMessage,showNotification;
        message_side = 'right';
        getMessageText = function () {
            var $message_input;
            $message_input = $('.message_input');
            return $message_input.val();
        };
        sendMessage = function (text,username) {
            console.log('text');
            console.log(text);
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            //message_side = message_side === 'left' ? 'right' : 'left';
            
            message = new Message({
                text: text,
                message_side: message_side,
                username: username
            });
            message.draw();
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        };

        $('#connect').click(function (e) {
            socket.emit('login',JSON.parse(localStorage.getItem('user')).username);
        });
        
        showNotification = function (msg) {
            var id = Date.now();
            var noti = `<div id="${id}" class="alert ${msg.type} alert-dismissible fade show animated fadeOut delay-5s" role="alert">
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            ${msg.text}
                        </div>`;
            $('#notification-holder').prepend(noti);
            setTimeout(function(){
                $("#"+id ).remove();
            }, 6000);
        };

        socket.on('chat_message', function(message){
            console.log('socket.on');
            console.log(message);
            if(message.from != JSON.parse(localStorage.getItem('user')).username){
                message_side ='left';
                var res = sendMessage(message.message,message.from);
                console.log(res);
            }
        });

        socket.on('login', function(user){
            localStorage.setItem('user', JSON.stringify(user));
        });

        socket.on('user_offline', function(user){
           // localStorage.setItem('user', JSON.stringify(user));
           console.log(user);
           if(!user.is_active){
            $('#rainbomuserstatus').removeClass('online').addClass('offline');
           }

           var raondChat = JSON.parse(localStorage.getItem('randomchat'));
           var u = raondChat.users.find(x=>x._id==user._id);
           console.log('u');
           console.log(u);
        });


        $('.send_message').click(function (e) {
            var txt = getMessageText();
            if(txt!=''){
                message_side ='right';
                sendMessage(txt,JSON.parse(localStorage.getItem('user')).username);

                socket.emit('chat_message',{
                    message:txt,
                    from: JSON.parse(localStorage.getItem('user')).username
                });
            }
        });

        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                var txt = getMessageText();
                if(txt!=''){
                    message_side ='right';
                    sendMessage(txt,JSON.parse(localStorage.getItem('user')).username);
                   // console.log(res);
                    socket.emit('chat_message',{
                        message:txt,
                        from: JSON.parse(localStorage.getItem('user')).username
                    });
                }
            }
        });

        $('#signout').click(function (e) {
            $.post("http://localhost:8080/signout",{"username":$('#txtuserName').val().trim()}, function(data){
                if(data===true)
                {
                    localStorage.removeItem('user');
                    localStorage.removeItem('login');
                    $('.login-wrapper').show();
                    
                    $('.username-holder').text('');
                    $('#userstatus').addClass('offline');

                    showNotification({
                        text:'Successfully signout',
                        type:notiTypes.SUCCESS
                    });
                }
            });
        });

        $('#test').click(function (e) {
            showNotification({
                text:'sampel message',
                type:notiTypes.SUCCESS
            });
        });

        $('.btn-login').click(function (e) {
           if($('#txtuserName').val().trim()!=''){
                $.post("http://localhost:8080/isnameexist",{"username":$('#txtuserName').val().trim()}, function(data){
                    if(data===true)
                    {
                        showNotification({
                            text:'Username already exist!',
                            type:notiTypes.WARNING
                        });
                    }
                    else{
                        showNotification({
                            text:'Successfully login',
                            type:notiTypes.SUCCESS
                        });

                        console.log($('#txtuserName').val().trim());
                        $('.login-wrapper').hide();
                        localStorage.setItem('login', true);

                        $('.username-holder').text($('#txtuserName').val().trim());
                        $('#userstatus').removeClass('offline').addClass('online');
                        socket.emit('login',$('#txtuserName').val().trim());
                        $('#txtuserName').val() =='';
                    }
                });
           }
        });

        // function getUser(){
        //     $.post("http://localhost:8080/user",{"username":$('#txtuserName').val().trim()}, function(data){
        //         console.log(data);
        //     });
        // }

        $('#btn-endchat').click(function (e) {
        //     $.post("http://localhost:8080/disconnect",{socketid:JSON.parse(localStorage.getItem('user')).socketid},function(data){

        //     });
            socket.emit('close_connection',JSON.parse(localStorage.getItem('user')));
        });

        $('#btn-newpartner').click(function (e) {
            $.post("http://localhost:8080/getrandom",{"userid":JSON.parse(localStorage.getItem('user'))._id}, function(data){
                if(data.users.length>0){
                    localStorage.setItem('randomchat', JSON.stringify(data));
                    $('.random-username-holder').text(data.users[1].username);
                    if(data.users[1].is_online)
                        $('#rainbomuserstatus').removeClass('offline').addClass('online');
                    else
                        $('#rainbomuserstatus').removeClass('online').addClass('offline');
                }
            });
        });

        if(localStorage.getItem('login')=='true'){
            $('.login-wrapper').hide();
            console.log(JSON.parse(localStorage.getItem('user')).username);
            $('.username-holder').text(JSON.parse(localStorage.getItem('user')).username);
            $('#userstatus').removeClass('offline').addClass('online');
            socket.emit('chat-reconnect',JSON.parse(localStorage.getItem('user')).username);
        }
        else{
            $('.login-wrapper').show();
        }

        if(localStorage.getItem('randomchat')!=undefined){
           var raondChat = JSON.parse(localStorage.getItem('randomchat'));
           console.log(raondChat);
            $('.random-username-holder').text(raondChat.users[1].username);
            if(raondChat.users[1].is_online)
                $('#rainbomuserstatus').removeClass('offline').addClass('online');
            else
                $('#rainbomuserstatus').removeClass('online').addClass('offline');
        }
    });

}.call(this));