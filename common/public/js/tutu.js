tutu = {};

$(function() {
    toastr.options = {
        closeButton: true,
        progressBar: true,
        showMethod: 'slideDown',
        timeOut: 4000
    };
    // regist first login welcome toast
    $(document).on('toast', function(event, data) {
        if (data.type) {
            toastr[data.type](data.content, data.title);
        } else {
            toastr.success(data.content, data.title);
        }
    });

    $(document).on('refresh', function(event, data) {
        location.reload();
    });

    $('#changePass').on('click', function(event) {
        var originPass = $('#originPassword').val();
        var newPass = $('#newPassword').val();
        var confirmPass = $('#confirmPassword').val();

        if (!originPass || !newPass || !confirmPass) {
            return swal('请填写完整信息', null, 'error');
        }

        if (newPass !== confirmPass) {
            return swal('两次密码不相等', null, 'error');
        }

        swal({
                title: "请确认",
                text: "确认要修改密码吗？",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确认",
                cancelButtonText: "取消",
                closeOnConfirm: false
            },
            function() {
                $.ajax({
                    type: 'POST',
                    data: {
                        originPass: originPass,
                        newPass: newPass,
                    },
                    url: '/admin/changePassword',
                    success: function(result) {
                        if (result.code == 200) {
                            swal("操作成功!", "请使用新密码重新登录", "success");
                            location.reload();
                        } else {
                            swal("发生错误!", result.errMsg ? result.errMsg : null, "error");
                        }
                    },
                    error: function() {
                        swal("发生错误!", null, "error");

                    }
                });
            });
    });

    $('.commonCreate').on('click', function(event) {
        $('#createModal').load('/admin/' + $(event.currentTarget).data('modelName') + '/edit', function() {
            $('#createModal').modal();
        });
    });

    $('#createModal').on('click', '.commonSave', function(event) {
        var formData = $('#createModal form').serialize();
        $.ajax({
            type: 'POST',
            data: formData,
            url: '/admin/' + $('#createModal form').data('modelName') + '/edit/' + $(event.currentTarget).data('id'),
            success: function(result) {
                if (result.code == 200) {
                    swal("操作成功!", null, "success");
                    $('#createModal').modal('hide');
                    tutu.table.clearPipeline();
                    tutu.table.ajax.reload();
                } else {
                    swal("发生错误!", result.errMsg ? result.errMsg : null, "error");
                }
            },
            error: function() {
                swal("发生错误!", null, "error");

            }
        });
    });

    $('#createModal').on('show.bs.modal', function(e) {
        $('[tutu-select]').each(function(i, e) {
            var element = $(e);
            if (e.hasAttribute('tutu-select-empty')) {
                element.append($('<option>'));
            }
            $.ajax({
                type: 'GET',
                url: '/admin/' + element.data('linkName') + '/getList',
                success: function(result) {
                    if (result.code == 200) {
                        result.list.forEach(function(item) {
                            var option = $('<option>');
                            option.val(item[element.data('linkValueProp')]);
                            option.html(item[element.data('linkHtmlProp')]);
                            if (element.data('linkId') == item[element.data('linkValueProp')]) {
                                option.prop('selected', 'selected');
                            }
                            element.append(option);
                        });
                        if (element.hasClass('chosen-select')) {
                            element.chosen({});
                        }
                    } else {
                        swal("发生错误!", result.errMsg ? result.errMsg : null, "error");
                    }
                }
            });
        });
    });

    $('.chosen-select').chosen({});
});