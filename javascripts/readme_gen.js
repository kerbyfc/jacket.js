window.onbeforeunload = function(){
  if (window.changed) {
    return 'Do you save your chages?';
  }
};

window.changed = false;

window.log = function() {

  var non_comment = false;
  if (arguments.length) {
    if (arguments[0] === 'non_comment') {
      arguments = Array.prototype.slice.call(arguments, 1);
      non_comment = true;
    }
  }

  if (arguments.length) {
    
    var text = '\n';

    for (var i in arguments) {
      var res, txt = arguments[i];
      try {
        if ( (typeof txt).match(/object/i) ) {
          res = JSON.prune(txt, 1);
        } else {
          res = txt.toString();
        }
      } catch (e) {
        res = typeof txt;
      }
      text += res + ' ';
    }

    if (!non_comment) {
      text = text.replace(/(\n)/g, '\n\/\/ ').replace(/-[\s]*[-]+/g, '');
      console.log.apply(console, arguments);
    }

    window.log_text += text;
  }
};

window.queue = [];

Jacket.log = window.log;
Jacket.err = window.log;

window.text = function(txt) {
  $('#source').val( $('#source').val() + txt );
};

window.code = function(fn) {
  window.log_text = '```javascript';
  log('non_comment', fn.toString().slice(13, -1).replace(/\n\s{1,8}/g, '\n').replace(/\slog[\s]*\(/g, 'console.log('));
  try {
    fn.call(window);
  } catch (e) {
    log(e.message);
  }
  window.log_text += '\n```';
  window.text( window.log_text.replace(/[\n]+[\s]*[\n]+/g,'\n\n') );
};

window.$$ = function() {
  if (typeof arguments[0] === 'function') {
    window.queue.push(arguments[0]);
  } else {
    var args = Array.prototype.slice.call(arguments);
    var output = '\n' + args.join('\n') + '\n';
    window.queue.push(output);
  }
};

window.run = function(){
  
  $('#preview').empty();
  $('#source').val('');
  _.each(window.queue, function(task) {
    if (typeof task == 'function') {
      window.code(task);
    } else {
      window.text(task);
    }
  });
  
  $('#preview').html( marked($('#source').val()) );
  $('#source').triggerHandler('change');

};

$('#source').on('keyup', function(){
  window.changed = true;
});



$('#source').on('keyup change', function(e){
  
  $('#preview').html( marked( $(this).val()) );

  $('pre code').each(function(i, e) {
    hljs.highlightBlock(e);
  });

});










