(function () {
    var socket = io();
    var Message;
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
        var getMessageText, message_side, sendMessage;
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
        
        socket.on('chat_message', function(message){
            console.log('socket.on');
            console.log(message);
            if(message.from != JSON.parse(localStorage.getItem('user')).username){
                message_side ='left';
                var res = sendMessage(message.message,message.from);
                console.log(res);
            }
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

        $('.btn-login').click(function (e) {
           if($('#txtuserName').val().trim()!=''){
                console.log($('#txtuserName').val().trim());
                $('.login-wrapper').hide();
                localStorage.setItem('login', true);
                localStorage.setItem('user', JSON.stringify({
                    username:$('#txtuserName').val().trim()
                }));

                $('.username-holder').text($('#txtuserName').val().trim());
                $('#userstatus').removeClass('offline').addClass('online');
                socket.emit('login',JSON.parse(localStorage.getItem('user')).username);
           }
        });

        if(localStorage.getItem('login')=='true'){
            $('.login-wrapper').hide();
            console.log(JSON.parse(localStorage.getItem('user')).username);
            $('.username-holder').text(JSON.parse(localStorage.getItem('user')).username);
            $('#userstatus').removeClass('offline').addClass('online');
            socket.emit('login',JSON.parse(localStorage.getItem('user')).username);
        }
    });
}.call(this));