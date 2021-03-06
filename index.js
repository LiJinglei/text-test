/**
 * 规范 调用插件固定参数
 * parameters:参数, callback:回调函数
 */

"use strict";

(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.approveAbstractAction = factory();
    }
})(window, function () {

    /**
     * 进入审批页面时的触发事件
     * @param parameters 包含用户信息、用户授权信息等
     * @param callback 处理业务逻辑完成时的回掉了函数
     */
    function authSuccessEvent(parameters, callback) {
        // console.log(parameters);

        var scriptJquery = document.createElement('script');
        scriptJquery.setAttribute('id', 'scriptJquery');
        scriptJquery.src = "assets/lib/integrate/wh0u1n36/jquery-3.3.1.min.js";
        document.head.appendChild(scriptJquery);

        callback()
    }

    /**
     * 按钮动作触发前事件
     * @param actionType 详细见文档
     * @param parameters 包含用户信息、用户授权信息、单据信息等
     * @param callback 处理业务逻辑完成时的回掉了函数
     */
    function doActionBeforeEvent(actionType, parameters, callback) {
        // 判断动作类型, 只处理审核动作
        var actionCode = actionType.code;
        var arr=["doAgreeOfList", "selectDoAgreeOfList", "doAgree"];
        if(arr.includes(actionCode)) {
            // console.log(actionType, parameters);

            // 设置签名后callback
            window.signedCallback = callback;
            window.signedActionType = actionType;
            window.signedParameters = parameters;

            // 创建签名iframe
            var url = "assets/lib/integrate/wh0u1n36/sign.html";
            url = "assets/lib/integrate/wh0u1n36/sign.html";
            createRlsbIframe(url);
        } else {
            callback();
        }
    }

    function createRlsbIframe(url) {
        var iframeRlsb = document.createElement('iframe');
        iframeRlsb.setAttribute('src', url);
        iframeRlsb.setAttribute('id', 'iframeRlsb');
        iframeRlsb.setAttribute('border', 0);
        iframeRlsb.style.cssText = 'width: 100vw;height: 100vh;position: fixed;border: 0;';
        document.body.appendChild(iframeRlsb);
    }

    /**
     * 按钮动作触发后事件
     * @param actionType 详细见文档
     * @param parameters 包含用户信息、用户授权信息、单据信息等
     * @param callback 处理业务逻辑完成时的回掉了函数
     */
    function doActionAfterEvent(actionType, parameters, callback) {
        // console.log(actionType, parameters);
        callback()
    }

    return {
        authSuccessEvent: authSuccessEvent,
        doActionBeforeEvent: doActionBeforeEvent,
        doActionAfterEvent: doActionAfterEvent
    };
});

/**
 * 签名完成
 */
function signedApprove(signType, imageData) {
    var param = {
        signType: signType,
        userInfo: window.signedParameters.userInfo,
        imageData: imageData,
    };
    var actionCode = window.signedActionType.code;
    if(actionCode == "doAgreeOfList") {
        // 列表-审批
        param.taskIds = [window.signedParameters.itemInfo.taskid];
    } else if(actionCode == "selectDoAgreeOfList") {
        // 列表-批量审批 selectInfo.taskid
        param.taskIds = [];
        var selectInfo = window.signedParameters.selectInfo;
        for(var index = 0; index < selectInfo.length; index++) {
            param.taskIds.push(selectInfo[index].taskid);
        }
    } else if(actionCode == "doAgree") {
        // 批准, 明细审批按钮
        var href = window.location.href;
        var startStr = "taskid";
        var startIndex = href.indexOf(startStr) + startStr.length + 1;
        href = href.substr(startIndex);
        param.taskIds = [href.substr(0, href.indexOf("/"))];
    }
    // 提交
    $.ajax({
        url: 'approve/certificate/doActionBefore',
        data: JSON.stringify(param),
        method: "POST",
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            if(data.code == 0) {
                // 关闭签名窗口
                var x = document.getElementById("iframeRlsb")
                x.remove(x.selectedIndex)
                // 回调
                window.signedCallback()
            } else {
                alert(data.msg);
            }
        },
        error: function (err) {
            console.error(err);
        }
    });
}

/**
 * 签名完成
 */
function cancelSign() {
    // 关闭签名窗口
    var x = document.getElementById("iframeRlsb")
    x.remove(x.selectedIndex)
}
