/*
 * +adammacias
 * http://codepen.io/adammacias/pen/WvxVRP
 * Modified by +Olumide  on Tuesday 16th February 2016. 
*/
jQuery(document).ready(function($) {
  
    // Fixa navbar ao ultrapassa-lo
    var limit = $('#contact-text');
    var navbar = $('#navbar-main');
    $('body').scrollspy();
    distance = limit.offset().top,
        $window = $(window);
    if ($window.scrollTop() >= distance) {
        navbar.fadeIn(0);//.removeClass('hidden');
    } else {
        navbar.fadeOut(0);//.addClass('hidden');
    }
    $window.scroll(function() {
        if ($window.scrollTop() >= distance) {
            navbar.fadeIn(200);//.removeClass('hidden');
        } else {
            navbar.fadeOut(200);//.addClass('hidden');
        }
    });
});
