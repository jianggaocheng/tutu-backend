tutu = {};

$(function() {
    // regist first login welcome toast
    $(document).on('toast', function(event, data) {
        toastr.options = {
            closeButton: true,
            progressBar: true,
            showMethod: 'slideDown',
            timeOut: 4000
        };
        toastr.success(data.content, data.title);
    });

    $('.backupDB').on('click', function(event) {
        // $.ajax({
        //     type: 'POST',
        //     url: '/admin/' + jqTable.data('modelName') + '/delete',
        //     success: function(result) {
        //         if (result.code == 200) {
        //             swal("操作成功!", null, "success");
        //             tutu.table.clearPipeline();
        //             tutu.table.ajax.reload();
        //         } else {
        //             swal("发生错误!", null, "error");
        //         }
        //     }
        // });
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
            }
        });
    });


});