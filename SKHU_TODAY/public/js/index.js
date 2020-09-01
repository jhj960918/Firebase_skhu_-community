  // Initialize Firebase
  var config = {
   apiKey: "AIzaSyA7H-oBechpYLCu4X0dXs6PKVthHujt93c",
    authDomain: "fir-chatting-6206.firebaseapp.com",
    databaseURL: "https://fir-chatting-6206.firebaseio.com",
    projectId: "fir-chatting-6206",
    storageBucket: "fir-chatting-6206.appspot.com",
    messagingSenderId: "675905395299",
    appId: "1:675905395299:web:5d71c7b8190c323b67f656",
    measurementId: "G-5579GW89VM"
  };
  firebase.initializeApp(config);

  /***** 전역변수 설정 *****/
  var log = console.log;
  var auth = firebase.auth();
  var db = firebase.database();
  var googleAuth = new firebase.auth.GoogleAuthProvider();
  var ref = null;
  var user = null;
  var key = ' ';

  /***** Auth *****/
  $("#login_bt").on("click", function () {
    auth.signInWithPopup(googleAuth);
    //auth.signInWithRedirect(googleAuth);
  });
  $("#logout_bt").on("click", function () {
    auth.signOut();
  });

  auth.onAuthStateChanged(function (result) {
    if (result) {
      user = result;
      var email = '<img src="' + result.photoURL + '" style="width:24px;border-radius:50%;"> ' + result.email;
      $("#login_bt").hide();
      $("#logout_bt").show();
      $("#user_email").html(email);
    } else {
      user = null;
      $("#login_bt").show();
      $("#logout_bt").hide();
      $("#user_email").html('');
    }
    init();
  });

  /***** Database *****/
  function init() {
    $(".gbooks").empty();
    ref = db.ref("root/gbook");

    ref.on("child_added", onAdd);
    ref.on("child_removed", onRev);
    ref.on("child_changed", onChg);
  }

  function onAdd(data) {
    var k = data.key;
    var v = data.val();
    var date = tsChg(v.wdate);
    var html = '<ul id="'+k+'" data-uid="'+v.uid+'" class="gbook">';
    var icon = "";
    if (user) {
      if (user.uid == v.uid) {
        icon += '<i onClick ="onUpdate(this);" class="fas fa-edit"></i>';
        icon += '<i onClick ="onDelete(this);" class ="fas fa-trash"></i>';
      }
    }
    var html = '<ul id="' + k + '" data-uid="' + v.uid + '" class="gbook">';
    html += '<li>' + v.uname + ' (' + v.email + ') | <span>' + date + '</span> </li>';
    html += '<li>' + v.content + '</li>';
    html += '<li>' + icon + '</li>';
    html += '</ul>';
    $(".gbooks").prepend(html);
  }

  function onRev(data) {
    var k = data.key;
    $("#" + k).remove();
  }

  function onChg(data) {
    var k = data.key;
    var v = data.val();
    $('#'+k).children("li").eq(0).children("span").html(tsChg(v.wdate));
    $('#'+k).children("li").eq(1).html(v.content);
    $("#"+k).find(".fa-edit").show();
  }

  function tsChg(ts){
    var d = new Date(ts);
    var month = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    var date = String(d.getFullYear()).substr(2) + "년" + month[d.getMonth()] + zeroAdd(d.getDate()) + "일" + zeroAdd(d.getHours()) + ":" + zeroAdd(d.getMinutes()) + ":" + zeroAdd(d.getSeconds());
    return date;
  }

  function zeroAdd(n) {
    if (n < 10) return "0" + n;
    else return n;
  }

  $("#save_bt").on("click", function () {
    var $content = $("#content");
    if ($content.val() == "") {
      alert("내용을 입력하세요.");
      $content.focus();
    } else {
      ref = db.ref("root/gbook");
      ref.push({
        email: user.email,
        uid: user.uid,
        uname: user.displayName,
        content: $content.val(),
        wdate: Date.now()
      }).key;
      $content.val('');
    }
  });

  function onUpdate(obj) {
    key = $(obj).parent().parent().attr("id");
    var $target = $(obj).parent().prev();
    var v = $(obj).parent().prev().html();
    var html = '<input type="text" class="w3-input w3-show-inline-block w3-border w3-border-red" style="width:calc(100% - 150px);" value="' + v + '">&nbsp;';
    html += '<button type="button" class="w3-button w3-orange" style="margin-top:-4px;" onclick="onUpdateDo(this);">수정</button>';
    html += '<button type="button" class="w3-button w3-black" style="margin-top:-4px;" onclick="onCancel(this, \' ' + v + ' \'); ">취소</button>';
    $target.html(html);
    $(obj).hide();
  }

  function onCancel(obj, val) {
    var $target = $(obj).parent().html(val);
    $target.parent().parent().find(".fa-edit").show();
  }

  function onUpdateDo(obj) {
    var $input = $(obj).prev();
    var content = $input.val();
    key = $(obj).parent().parent().attr("id");
    ref = db.ref("root/gbook/" + key).update({
      content: content,
      wdate: Date.now()
    });
  }

  function onDelete(obj, val) {
    key = $(obj).parent().parent().attr("id");
    if (confirm("정말 삭제하시겠습니까?")) {
      db.ref("root/gbook/" + key).remove();
    }

  }




const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();


exports.sendNotification = functions.database.ref('Messages/{roomId}/{messageId}').onCreate(event => {
    console.log('event.data: ', event.data);
    console.log('event.data.val() : ', event.data.val());

    const dataVal = event.data.val();
    if (!dataVal) {
        return console.log('Message data null! ');
    }

    const roomId = event.params.roomId; //이벤트가 발생한 방ID
    const sendMessageUserId = dataVal.uid; //메세지 발송자 ID
    const sendUserName = dataVal.userName; //메세지 발송자 이름
    const sendMsg = dataVal.message; //메세지
    const sendProfile = dataVal.profileImg ? dataVal.profileImg : ''; // 프로필 이미지
    const promiseRoomUserList = admin.database().ref(`RoomUsers/${roomId}`).once('value'); // 채팅방 유저리스트
    const promiseUsersConnection = admin.database().ref('UsersConnection').orderByChild('connection').equalTo(true).once('value'); // 접속자 데이터

    return Promise.all([promiseRoomUserList, promiseUsersConnection]).then(results => {
        const roomUsersSnapShot = results[0];
        const usersConnectionSnapShot = results[1];
        const arrRoomUserList =[];
        const arrConnectionUserList = [];

        if(roomUsersSnapShot.hasChildren()){
            roomUsersSnapShot.forEach(snapshot => {
                arrRoomUserList.push(snapshot.key);
            })
        }else{
            return console.log('RoomUserlist is null')
        }

        if(usersConnectionSnapShot.hasChildren()){
            usersConnectionSnapShot.forEach(snapshot => {
                const value  = snapshot.val();
                if(value){
                    arrConnectionUserList.push(snapshot.key);
                }
            })
        }else{
            return console.log('UserConnections Data가 없습니다');
        }

        const arrTargetUserList = arrRoomUserList.filter(item => {
            return arrConnectionUserList.indexOf(item) === -1;
        });


        console.log('arrTargetUserList : ',arrTargetUserList);
        const arrTargetUserListLength = arrTargetUserList.length;
        for(let i=0; i < arrTargetUserListLength; i++){
            console.log(`FcmId/${arrTargetUserList[i]}`);
            admin.database().ref(`FcmId/${arrTargetUserList[i]}`).once('value',fcmSnapshot => {
                console.log('FCM Token : ', fcmSnapshot.val());
                const token = fcmSnapshot.val();
                if(token){
                    const payload = {
                        notification: {
                            title: sendUserName,
                            body: sendMsg,
                            click_action :`http://fb-tutorial-chat.firebaseapp.com/?roomId=${roomId}`,
                            icon: sendProfile
                        }
                    };
                    admin.messaging().sendToDevice(token, payload).then(response => {
                        response.results.forEach((result, index) => {
                            const error = result.error;
                            if (error) {
                                console.error('FCM 실패 :', error.code);
                            }else{
                                console.log('FCM 성공');
                            }
                        });
                    });
                }

            });
        }

    });
});