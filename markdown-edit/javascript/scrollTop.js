// Generated by CoffeeScript 1.3.3

$(function() {
  var backToDiv,
    _this = this;
  if (typeof console !== "undefined" && console !== null) {
    // console.log('scrollTop.coffee(js) is alrady');
  }
  backToDiv = "<div id='back-to-top' style='position:fixed;right:10px;bottom:10px'><a href='#'><i class='icon-arrow-up'></i>back-to-top</a></div>";
  $('body').append(backToDiv);
  $('#back-to-top').hide();
  $(window).scroll(function() {
    if (($(this)).scrollTop() > 60) {
      $('#back-to-top').fadeIn();
    } else {
      $('#back-to-top').fadeOut();
    }
  });
  $('#back-to-top a').click(function() {
    $('body').animate({
      scrollTop: 0
    }, 500);
    return false;
  });
});