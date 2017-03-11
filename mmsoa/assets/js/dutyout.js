/**
 * Created by 钟凌山 on 2016/11/20.
 */
var room_list = [];
var roomid_list = [];
var name_list = [];
var wid_list = [];
var problem_list = [];
var problemid_list = [];
var dutyid_list = [];
var weekday_list = [];
var period_list = [];

/*
 * 获得标准格式的当前时间
 * yyyy-mm-dd hh:ii
 */
function getFormatDate(date_in) {
    var year = date_in.getFullYear();
    var month = (date_in.getMonth() + 1) >= 10 ? ((date_in.getMonth() + 1)) : ('0' + (date_in.getMonth() + 1));
    var day = date_in.getDate() >= 10 ? date_in.getDate() : ('0' + date_in.getDate());
    var hour = date_in.getHours() >= 10 ? date_in.getHours() : ('0' + date_in.getHours());
    var minute = date_in.getMinutes() >= 10 ? date_in.getMinutes() : ('0' + date_in.getMinutes());
    var second = date_in.getSeconds() >= 10 ? date_in.getSeconds() : ('0' + date_in.getSeconds());
    return year + '-' + month + '-' + day + ' '
        + hour + ':' + minute + ':' + second;
}

function getNowDutyId() {
    /*
     值班时间段
     1 - 07:30~10:30
     2 - 10:30~12:30
     3 - 12:30~14:00
     4 - 14:00~16:00
     5 - 16:00~18:00
     6 - 18:00~22:00
     7 - 07:30~12:30(周末)
     8 - 12:30~18:00(周末)
     9 - 18:00~22:00(周末)
     */

    var h11 = 7, h12 = 10, h21 = 10, h22 = 12, h31 = 12, h32 = 14, h41 = 14, h42 = 16, h51 = 16,
        h52 = 18, h61 = 18, h62 = 22, h71 = 7, h72 = 12, h81 = 12, h82 = 18, h91 = 18, h92 = 22;
    var m11 = 30, m12 = 30, m21 = 30, m22 = 30, m31 = 30, m32 = 0, m41 = 0, m42 = 0, m51 = 0,
        m52 = 0, m61 = 0, m62 = 0, m71 = 30, m72 = 30, m81 = 30, m82 = 0, m91 = 0, m92 = 0;

    function isBigger(h1, m1, h2, m2) {
        if (h1 > h2) return true;
        if (h1 < h2) return false;
        if (m1 >= m2) return true;
        return false;
    }

    var date = new Date();
    var day = date.getDay();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var dutyid = -1;
    var period = -1;

    if (day > 0 && day < 6) {
        if (isBigger(hour, minute, h11, m11) && isBigger(h12, m12, hour, minute)) period = 1;
        if (isBigger(hour, minute, h21, m21) && isBigger(h22, m22, hour, minute)) period = 2;
        if (isBigger(hour, minute, h31, m31) && isBigger(h32, m32, hour, minute)) period = 3;
        if (isBigger(hour, minute, h41, m41) && isBigger(h42, m42, hour, minute)) period = 4;
        if (isBigger(hour, minute, h51, m51) && isBigger(h52, m52, hour, minute)) period = 5;
        if (isBigger(hour, minute, h61, m61) && isBigger(h62, m62, hour, minute)) period = 6;
    } else {
        if (isBigger(hour, minute, h71, m71) && isBigger(h72, m72, hour, minute)) period = 7;
        if (isBigger(hour, minute, h81, m81) && isBigger(h82, m82, hour, minute)) period = 8;
        if (isBigger(hour, minute, h91, m91) && isBigger(h92, m92, hour, minute)) period = 9;
    }
    if (day == 0) day = 7;

    if (period == -1) {
        return -1;
    } else {
        $.ajax({
            'type': 'post',
            'url': 'DutyOut/getDutyIdByPeriod',
            'async': false,
            'data': {
                'weekday': day,
                'period': period
            },
            success: function (msg) {
                var ret = JSON.parse(msg);
                if (ret['status'] == true) {
                    dutyid = ret['dutyid'];
                }
            }
        });
    }
    return dutyid;
}

$.ajax({
    type: "GET",
    url: "DutyOut/getInformation",
    success: function (msg) {
        //console.log(msg);
        var ret = JSON.parse(msg);
        if (ret['status'] === false) {
            alert(ret['msg']);
        } else {
            var data = ret.data;
            room_list = data.room_list;
            roomid_list = data.roomid_list;
            name_list = data.name_list;
            wid_list = data.wid_list;
            problem_list = data.problem_list;
            problemid_list = data.problemid_list;
            dutyid_list = data.dutyid_list;
            weekday_list = data.weekday_list;
            period_list = data.period_list;
        }
    },
    error: function () {
        alert(arguments[1]);
    }
});


function delete_by_doid(doid) {
    var notice = "确认要删除序号为 " + doid + " 的记录吗？";
    if (confirm(notice)) {
        $.ajax({
            'type': 'post',
            'url': 'DutyOut/delete_dutyout',
            'data': {
                'doid': doid
            },
            success: function (msg) {
                var ret = JSON.parse(msg);
                if (ret['status'] == true) {
                    //alert(ret['msg']);
                    $("#duty_content_" + doid).remove();
                } else {
                    alert(ret['msg']);
                }
            }
        });
    }
}

function not_null(para) {
    if (para == "" || para == null || para == undefined) {
        return false;
    }
    return true;
}


function updateProblem(pid) {
    var time = $('#start_dtp').val();
    var date = new Date(time.substr(0, 10) + "T" + time.substr(11, 8));
    var solved_time = getFormatDate(date);
    var wid = $('#select_name').val();
    var solution = $('#ccomment').val();
    console.log(wid, pid, solved_time, solution);
    $.ajax({
        type: "post",
        url: "Problem/updateProblem",
        data: {
            "solve_wid": wid,
            "solved_time": solved_time,
            "solution": solution,
            "pid": pid
        },
        async: false,
        success: function (msg) {
            var ret = JSON.parse(msg);
            if (ret['status'] === false) {
                alert(ret['msg']);
            }
        },
        error: function () {
            alert(arguments[1]);
        }
    });
}

function insert_dutyout_alone(dutyout_wid, dutyid, pid) {
    var ret = "";
    $.ajax({
        'type': 'POST',
        'url': 'DutyOut/add',
        'async': false,
        'data': {
            'wid': dutyout_wid,
            'dutyid': dutyid,
            'problemid': pid
        },
        success: function (msg) {
            //console.log(msg);
            ret = JSON.parse(msg);
        },
        error: function (msg) {
            //console.log(msg);
            ret = JSON.parse(msg);
        }
    });
    //console.log("dutyout inserted");
    return ret;
}

function insert_dutyout() {
    var dutyout_wid = $('#select_dutyout_name').val();
    var dutyid = $('#select_period').val();
    var found_name = $('#select_found_name').val();
    //下一句在 Safari 中会产生错误//已解决
    var time = $('#start_dtp').val();
    var date = new Date(time.substr(0, 10) + "T" + time.substr(11, 8));
    var found_time = getFormatDate(date);
    var roomid = $('#select_classroom').val();
    var description = $('#ccomment').val();
    var flag = true;//记录插入状态
    var pid = 0;
    //console.log(dutyout_wid, dutyid, found_name, found_time, description);
    //alert("ffff");
    if (!(not_null(dutyout_wid) && not_null(dutyid) && not_null(found_name) && not_null(found_time) &&
        not_null(description))) {
        alert("请正确填写信息！");
    } else {
        //先插入新的problem
        $.ajax({
            type: "POST",
            url: "DutyOut/insertProblem",
            async: false,
            data: {
                "founder_wid": found_name,
                "found_time": found_time,
                "roomid": roomid,
                "description": description
            },
            success: function (msg) {
                //console.log("problem msg", msg);
                var ret = JSON.parse(msg);
                if (ret['status'] === false) {
                    alert(ret['msg']);
                    flag = false;
                } else {
                    pid = ret['insert_id'];
                    //console.log("pid", pid);
                }
            },
            error: function () {
                alert(arguments[1]);
                flag = false
            }
        });
        //再插入新的dutyout
        //console.log(flag, pid);
        if (flag == true) {
            var ret = insert_dutyout_alone(dutyout_wid, dutyid, pid);
            alert(ret['msg']);
        } else {
            alert("插入失败！");
        }
    }
    //alert("bbbb");
}

function new_record() {
    var initTime = getFormatDate(new Date());
    var room_options = "";
    var worker_options = "";
    var duty_options = "";
    roomid_list.forEach(function (item, index) {
        room_options = room_options + "<option value='" + roomid_list[index] + "'>" + room_list[index] + "</option>";
    });
    name_list.forEach(function (item, index) {
        worker_options = worker_options + "<option value='" + wid_list[index] + "'>" + name_list[index] + "</option>";
    });
    dutyid_list.forEach(function (item, index) {
        duty_options = duty_options + "<option value='" + dutyid_list[index] + "'>星期" + weekday_list[index] + " " + period_list[index] + "</option>";
    });
    var now_duty_id = getNowDutyId();

    $("#myModalLabelTitle").text("新增记录");
    $("#modalBody").html(
        '      <form class="form-horizontal m-t" id="commentForm"> ' +
        '          <div class="form-group"> ' +
        '              <label class="col-sm-3 control-label">出勤人：</label> ' +
        '              <div class="col-sm-8"> ' +
        '                  <select id="select_dutyout_name" name="select_dutyout_name" data-placeholder="" class="chosen-select-name col-sm-12" tabindex="4"> ' +
        '                    <option value="">选择助理</option> ' + worker_options +
        '                  </select> ' +
        '              </div> ' +
        '          </div> ' +
        '          <div class="form-group"> ' +
        '              <label class="col-sm-3 control-label">值班时段：</label> ' +
        '              <div class="col-sm-8"> ' +
        '                   <select id="select_period" name="select_period" data-placeholder="" class="form-control m-b chosen-select-classroom" tabindex="4"> ' +
        '                     <option value="">选择时段</option> ' + duty_options +
        '                   </select>' +
        '              </div> ' +
        '          </div> ' +
        '          <div class="form-group"> ' +
        '              <label class="col-sm-3 control-label">发现人：</label> ' +
        '              <div class="col-sm-8"> ' +
        '                  <select id="select_found_name" name="select_found_name" data-placeholder="" class="chosen-select-name col-sm-12" tabindex="4"> ' +
        '                    <option value="">选择助理</option> ' + worker_options +
        '                  </select> ' +
        '              </div> ' +
        '          </div> ' +
        '          <div class="form-group"> ' +
        '              <label class="col-sm-3 control-label">故障课室：</label> ' +
        '              <div class="col-sm-8"> ' +
        '                   <select id="select_classroom" name="select_classroom" data-placeholder="" class="form-control m-b chosen-select-classroom" tabindex="4"> ' +
        '                     <option value="">选择课室</option> ' + room_options +
        '                   </select>' +
        '              </div> ' +
        '          </div> ' +
        '          <div class="form-group"> ' +
        '              <label class="col-sm-3 control-label">发现时刻：</label> ' +
        '              <div class="col-sm-8"> ' +
        '                  <input type="text" id="start_dtp" class="input-sm form-control dtp-input-div" name="start" placeholder="开始时间" value="' + initTime + '" />' +
        '              </div> ' +
        '          </div> ' +
        '          <div class="form-group"> ' +
        '              <label class="col-sm-3 control-label">故障说明：</label> ' +
        '              <div class="col-sm-8"> ' +
        '                  <textarea id="ccomment" name="comment" class="form-control" required="" aria-required="true"></textarea> ' +
        '              </div> ' +
        '          </div> ' +
        '          <div class="form-group"> ' +
        '              <div class="col-sm-4 col-sm-offset-3"> ' +
        '                  <button onclick="insert_dutyout()" class="btn btn-primary" type="submit">提交</button> ' +
        '              </div> ' +
        '          </div> ' +
        '      </form> '
    );

    $('#start_dtp').datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        language: 'zh-CN',
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 0,
        forceParse: 1
    });
    $('#end_dtp').datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        language: 'zh-CN',
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 0,
        forceParse: 1
    });

    /* Chosen name */
    var config = {
        '.chosen-select-classroom': {
            // 实现中间字符的模糊查询
            search_contains: true,
            no_results_text: "没有找到",
            disable_search_threshold: 10,
            width: "200px"
        }
    };
    for (var selector in config) {
        $(selector).chosen(config[selector]);
    }

    /* Chosen classroom */
    var config_room = {
        '.chosen-select-name': {
            // 实现中间字符的模糊查询
            search_contains: true,
            no_results_text: "没有找到",
            disable_search_threshold: 10,
            width: "200px"
        }
    };
    for (var selector_room in config_room) {
        $(selector_room).chosen(config_room[selector_room]);
    }
    //console.log(wid_current);
    $('#select_found_name').val(wid_current);
    $('#select_found_name').prop("disabled", false);
    $('#select_found_name').trigger("chosen:updated");
    if (now_duty_id > -1) $('#select_period').val(now_duty_id);
    $('#select_period').trigger("chosen:updated");
}

function solve_by_pid(pid) {
    var initTime = getFormatDate(new Date());
    var worker_options = "";
    name_list.forEach(function (item, index) {
        worker_options = worker_options + "<option value='" + wid_list[index] + "'>" + name_list[index] + "</option>"
    });

    $("#myModalLabelTitle").text("解决");
    $("#modalBody").html(
        '      <form class="form-horizontal m-t" id="commentForm"> ' +
        '          <div class="form-group"> ' +
        '              <label class="col-sm-3 control-label">解决人：</label> ' +
        '              <div class="col-sm-8" id="total-chosen-select_name"> ' +
        '                  <select id="select_name" name="select_name" data-placeholder="" class="chosen-select-name col-sm-12" tabindex="4"> ' +
        '                    <option value="">选择助理</option> ' + worker_options +
        '                  </select> ' +
        '              </div> ' +
        '          </div> ' +
        '          <div class="form-group"> ' +
        '              <label class="col-sm-3 control-label">解决时刻：</label> ' +
        '              <div class="col-sm-8"> ' +
        '                  <input type="text" id="start_dtp" class="input-sm form-control dtp-input-div" name="start" placeholder="开始时间" value="' + initTime + '" />' +
        '              </div> ' +
        '          </div> ' +
        '          <div class="form-group"> ' +
        '              <label class="col-sm-3 control-label">解决方法：</label> ' +
        '              <div class="col-sm-8"> ' +
        '                  <textarea id="ccomment" name="comment" class="form-control" required="" aria-required="true"></textarea> ' +
        '              </div> ' +
        '          </div> ' +
        '          <div class="form-group"> ' +
        '              <div class="col-sm-4 col-sm-offset-3"> ' +
        '                  <button onclick="updateProblem(' + pid + ')" class="btn btn-primary" type="submit">提交</button> ' +
        '              </div> ' +
        '          </div> ' +
        '      </form> '
    );

    $('#start_dtp').datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        language: 'zh-CN',
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 0,
        forceParse: 1
    });
    $('#end_dtp').datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        language: 'zh-CN',
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 0,
        forceParse: 1
    });

    /* Chosen name */
    var config = {
        '#select_name': {
            // 实现中间字符的模糊查询
            search_contains: true,
            no_results_text: "没有找到",
            disable_search_threshold: 10,
            width: "200px"
        }
    };
    for (var selector in config) {
        $(selector).chosen(config[selector]);
    }
}