$(document).ready(function () {

    // Setup the Open / Close animation on the menu
    let trigger = $('.hamburger');
    let overlay = $('.overlay');
    let isClosed = false;

    trigger.click(function() {
        if (isClosed == true) {          
            overlay.hide();
            trigger.removeClass('is-open');
            trigger.addClass('is-closed');
            isClosed = false;
        } else {   
            overlay.show();
            trigger.removeClass('is-closed');
            trigger.addClass('is-open');
            isClosed = true;
        }
    });
    $('[data-toggle="offcanvas"]').click(function () {
        $('#wrapper').toggleClass('toggled');
    });
    
    // Setup page switching
    $(".sidebar-nav a[name]").on('click', function() {
        $("#page-content-wrapper .container").hide();
        $(`#page-content-wrapper [name=${$(this).prop('name')}]`).show();
    });
    $(".sidebar-nav a[name]").first().click();
});