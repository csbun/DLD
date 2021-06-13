function throttle(fn) {
  var _timer;
  return function() {
    clearTimeout(_timer);
    const args = arguments;
    _timer = setTimeout(function() {
      fn.apply(this, args)
    }, 300);
  }
}

function ajaxGet(url, data) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(ev) {
      if (xhr.readyState == 4) {
        if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
          try {
            var json = JSON.parse(xhr.responseText);
            resolve && resolve(json);
          } catch (err) {
            reject && reject(err);
          }
        } else {
          reject && reject(xhr);
        }
      }
    }
    var query = data ? Object.keys(data).map(function (key) {
      return key + '=' + encodeURIComponent(data[key]);
    }).join('&') : '';
    var newUrl = url + (url.indexOf('?') > 0 ? '&' : '?') + query;
    xhr.open('GET', newUrl);
    xhr.send(null);
  });
}

function setOutput(target, type, sentences) {
  var elLoading = target.querySelector('.loading');
  if (elLoading) {
    target.removeChild(elLoading);
  }
  if (sentences && sentences.length) {
    var elUl = document.createElement('ul');
    sentences.forEach(function (sentence) {
      var cn = document.createElement('li');
      cn.innerText = sentence;
      elUl.appendChild(cn);
    });
    var elSubTitle = document.createElement('h2');
    elSubTitle.innerText = type;
    target.appendChild(elSubTitle);
    target.appendChild(elUl);
  }
}

var isGoogle429TooManyRequestsTime = Date.now();
function translateWithGoogle(elOutput, text, targetLanguage) {
  if (Date.now() <= isGoogle429TooManyRequestsTime) {
    return;
  }
  var sl = 'auto';
  if (!targetLanguage || targetLanguage === 'AUTO') {
    // 如果有中文字符就翻译成英语，否则翻译成中文
    if (/[\u4e00-\u9fa5]/.test(text)) {
      sl = 'zh_CN';
      targetLanguage = 'en_US';
    } else {
      targetLanguage = 'zh_CN';
    }
  }
  ajaxGet('http://translate.google.cn/translate_a/single?client=gtx&dt=t&dj=1&ie=UTF-8', {
    sl: sl,
    tl: targetLanguage,
    q: text,
  })
  .then(function(res) {
    setOutput(elOutput, 'Google', (res.sentences || []).map(sentence => sentence.trans));
  })
  .catch(function (xhr) {
    // 如果 google 接口太频繁就禁用2h
    if (xhr && xhr.status === 429) {
      isGoogle429TooManyRequestsTime = Date.now() + 2 * 60 * 60 * 1000;
    }
  })
}

function translateWithYoudao(elOutput, text, targetLanguage) {
  // ZH_CN2EN 中文　»　英语
  // ZH_CN2JA 中文　»　日语
  // ZH_CN2KR 中文　»　韩语
  // ZH_CN2FR 中文　»　法语
  // ZH_CN2RU 中文　»　俄语
  // ZH_CN2SP 中文　»　西语
  var type = ({
    AUTO: 'AUTO',
    zh_CN: 'EN2ZH_CN',
    en_US: 'ZH_CN2EN',
  })[targetLanguage] || 'AUTO';
  ajaxGet('http://fanyi.youdao.com/translate?&doctype=json', {
    type: type,
    i: text,
  })
  .then(function(res) {
    var sentences = res.translateResult && res.translateResult[0] || []
    if (res.translateResult[0]) {
      setOutput(elOutput, 'YouDao', sentences.map(sentence => sentence.tgt));
    }
  });
}

function translateWithBing(elOutput, text) {
  ajaxGet('http://api.microsofttranslator.com/v2/Http.svc/Translate?appId=AFC76A66CF4F434ED080D245C30CF1E71C22959C', {
    to: 'zh',
    text: text,
  })
  .then(function(res) {
    console.log(res);
    // setOutput(elOutput, 'Bing', (res.sentences || []).map(sentence => sentence.trans));
  });
}

function translateWithBaidu() {
  // http://fanyi-api.baidu.com/api/trans/product/desktop?req=detail
}

function main() {
  var elInput = document.getElementById('input');
  elInput.addEventListener('input', throttle(function(e) {
    var elOutput = document.getElementById('output');
    elOutput.innerHTML = '<p class="loading">Loading...</p>';

    if (e.target.value) {
      var elLanguage = document.getElementById('lang');
      translateWithGoogle(elOutput, e.target.value, elLanguage.value);
      translateWithYoudao(elOutput, e.target.value, elLanguage.value);
      // translateWithBing(elOutput, e.target.value, elLanguage.value);
    }
  }));
  document.addEventListener('visibilitychange', function() {
    elInput.focus();
  });
  setTimeout(function() {
    elInput.focus();
  }, 100);
}

main();