(function(e){function r(t){if(e(t).hasClass("notrequired")){return true}if(e(t).val()==0||e(t).val()==""||e(t).val()==undefined){return false}else{return true}}function s(n){var r=e(n).val();if(e(n).attr("name")=="_Phone"||e(n).attr("name")=="HomePhone"){r=r.replace(/\D/g,"")}if(e(n).hasClass("notrequired")||r=="First Name"||r=="Last Name"){return true}$name=e(n).attr("name");var i=t[$name];if(i==undefined){var s=new RegExp(t["default"].regex);if(s.test(r)){return true}else return false}else{var s=new RegExp(t[$name].regex);if(s.test(r)){return true}else return false}}function o(t){if(e(t).hasClass("notrequired")){return true}$name=e(t).attr("name");$ref="input[name="+$name+"]";$testref="input[name="+$name+"]:checked";if(e($testref).length==0){return false}else{return true}}function u(){do{var t=Math.floor(Math.random()*999+1);var n="randomname"+t;var r="#"+n}while(e(r).length!=0);return n}function a(e){var t=e;var n=t.css("z-index");while(n=="auto"||n=="inherit"){t=t.parent();n=t.css("z-index")}return n}function f(t){e.ubvalidate.globals[t]={mobile:false,mobileoffset:-115,bubbleanimationtime:500,bindblur:true,zindex:null}}var t={NameFirst:{regex:/[a-zA-Z]{3,}/,failtext:"* Invalid First Name"},NameLast:{regex:/[a-zA-Z]{3,}/,failtext:"* Invalid Last Name"},AddressLine1:{regex:/\d+\s+[A-Za-z0-9]+/,failtext:"* Invalid Address"},AddressZip:{regex:/^\d{5}$/,failtext:"* Invalid Zip Code"},EmailAddress:{regex:/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,failtext:"* Invalid Email Address"},EMail:{regex:/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,failtext:"* Invalid Email Address"},HomePhone:{regex:/^([a-zA-Z,#/ \.\(\)\-\+\*]*[2-9])([a-zA-Z,#/ \.\(\)\-\+\*]*[0-9]){2}([a-zA-Z,#/ \.\(\)\-\+\*]*[2-9])([a-zA-Z,#/ \.\(\)\-\+\*]*[0-9]){6}[0-9a-zA-Z,#/ \.\(\)\-\+\*]*$/,failtext:"* Invalid Phone Number"},Phone:{regex:/^([a-zA-Z,#/ \.\(\)\-\+\*]*[2-9])([a-zA-Z,#/ \.\(\)\-\+\*]*[0-9]){2}([a-zA-Z,#/ \.\(\)\-\+\*]*[2-9])([a-zA-Z,#/ \.\(\)\-\+\*]*[0-9]){6}[0-9a-zA-Z,#/ \.\(\)\-\+\*]*$/,failtext:"* Invalid Phone Number"},AddressCity:{regex:/[a-zA-Z]{3,}/,failtext:"* Invalid City"},HSGradYear:{regex:"none",failtext:"* Please select a Grad Year"},EDUComplete:{regex:"none",failtext:"* Please select a Level of Education"},AddressState:{regex:"none",failtext:"* Please select a State"},MilitaryStatus:{regex:"none",failtext:"* Please select a Military Status"},AreaOfInterest:{regex:"none",failtext:"* Please select an Area of Interest"},_FirstName:{regex:/[a-zA-Z]{3,}/,failtext:"* Invalid First Name"},_LastName:{regex:/[a-zA-Z]{3,}/,failtext:"* Invalid Last Name"},Email:{regex:/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,failtext:"* Invalid Email Address"},_Phone:{regex:/^([a-zA-Z,#/ \.\(\)\-\+\*]*[2-9])([a-zA-Z,#/ \.\(\)\-\+\*]*[0-9]){2}([a-zA-Z,#/ \.\(\)\-\+\*]*[2-9])([a-zA-Z,#/ \.\(\)\-\+\*]*[0-9]){6}[0-9a-zA-Z,#/ \.\(\)\-\+\*]*$/,failtext:"* Invalid Phone Number"},_PostalCode:{regex:/^\d{5}$/,failtext:"* Invalid Zip"},_State:{regex:"none",failtext:"* Please select a state"},program:{regex:"none",failtext:"* Please select a program"},eduLevel:{regex:"none",failtext:"* Please select education level"},areaOfInterest:{regex:"none",failtext:"* Please area of interest"},Program:{regex:"none",failtext:"* Please select a program"},_City:{regex:/[a-zA-Z]{3,}/,failtext:"* Invalid City"},_Address:{regex:/\d+\s+[A-Za-z0-9]+/,failtext:"* Invalid Address"},_BizName:{regex:/[a-zA-Z0-9]{1,}/,failtext:"* Invalid Name"},_EmployeeNum:{regex:/[a-zA-Z0-9]{1,}/,failtext:"* Invalid Size"},"default":{regex:/[a-zA-Z0-9]{3,}/,failtext:"* This field is required"},dropdefault:{regex:"none",failtext:"* Please select one"},checkdefault:{regex:"none",failtext:"* This is required"}};var n={checks:{valid:function(t){e(t).addClass("ubvalid")},invalid:function(t){e(t).addClass("uberror")}},"default":{valid:function(t){e(t).addClass("ubvalid")},invalid:function(t){e(t).addClass("uberror")}},fancybubbles:{valid:function(t,n){$name=e(t).attr("name");$id="#"+n+$name+"Error";var r=false;if(e($id).length!=0){r=true}if(r){e($id).animate({opacity:"0.0"},e.ubvalidate.globals[n].bubbleanimationtime,function(){e(this).hide()})}},invalid:function(n,r){$name=e(n).attr("name");$id="#"+r+$name+"Error";var i=false;if(e($id).length!=0){i=true}$ref="input[name="+$name+"]";var s=t[$name];var o=e(n).offset();var u=e(n).outerWidth();var a=e(n).outerHeight();if(e(n).is(":checkbox")||e(n).is(":radio")){if(e(n).parent().is("label")){o=e(n).parent().offset();u=e(n).parent().outerWidth()}else if(e(n).next().is("label")){o=e(n).next().offset();u=e(n).next().outerWidth()}else{o=e(n).offset();u=e(n).outerWidth()}}var f=u+o.left+5;var l=o.top+a/2-12.5;if(e.ubvalidate.globals[r].mobile){f+=e.ubvalidate.globals[r].mobileoffset}if(i){e($id).show().animate({opacity:"0.87"},e.ubvalidate.globals[r].bubbleanimationtime);return}$appendhere="#"+r;e($appendhere).parent().css("position","relative");var c=e($appendhere).parent().offset();var h=l-c.top;var p=f-c.left;var d=parseInt(e.ubvalidate.globals[r].zindex)+1;e($appendhere).append('<div class="errorcontainer" id="'+r+$name+'Error" style=" z-index: '+d+"; top:"+h+"px; left:"+p+'px; opacity: 0.0;" ><p id="'+r+$name+'ErrorP"></p></div>');$id2="#"+r+$name+"ErrorP";if(t[$name]!=undefined){e($id2).append(t[$name].failtext)}else{e($id2).append(t["default"].failtext)}e($id).animate({opacity:"0.87"},e.ubvalidate.globals[r].bubbleanimationtime)},runafter:function(t){e(".errorcontainer").click(function(){e(this).stop();e(this).animate({opacity:"0.0"},e.ubvalidate.globals[t].bubbleanimationtime,function(){e(this).hide()})})}},checks:{valid:function(t,n){$name=e(t).attr("name");$id="#"+n+$name+"Error";var r=false;if(e($id).length!=0){r=true}if(r){e($id).animate({opacity:"0.0"},e.ubvalidate.globals[n].bubbleanimationtime/2,function(){e(this).hide()})}},invalid:function(t,n){var r=e(t);$name=e(t).attr("name");$id="#"+n+$name+"Error";var i=false;if(e($id).length!=0){i=true}var s=r.offset();var o=r.width();var u=r.outerHeight();var a=0;if(r.is(":checkbox")||r.is(":radio")){if(r.parent().is("label")){s=r.parent().offset();o=-22;a=6}else if(r.next().is("label")){o=-22;a=0}else{s=r.offset();o=r.outerWidth()}}var f=o+s.left+5;var l=s.top+u/2-7.5+a;if(e.ubvalidate.globals[n].mobile){f+=e.ubvalidate.globals[n].mobileoffset}if(i){e($id).show().animate({opacity:"0.87"},e.ubvalidate.globals[n].bubbleanimationtime);return}$appendhere="#"+n;e($appendhere).css("position","relative");var c=e($appendhere).parent().offset();var h=l-c.top;var p=f-c.left;var d=parseInt(e.ubvalidate.globals[n].zindex)+1;e($appendhere).append('<div class="imgerror" id="'+n+$name+'Error" style=" z-index: '+d+"; top:"+h+"px; left:"+p+'px; opacity: 0.0;" ><img src="http://cache.university-bound.com/validation/validationEngine/img/formx.png" alt="Error"/></div>');e($id).animate({opacity:"1.0"},e.ubvalidate.globals[n].bubbleanimationtime/2)}}};e.fn.ubvalidate=function(l){function m(t,i){if(n[p]==undefined){p="default"}var u=false;$textfields=t+" input[type=text]";$dropdowns=t+" select";$checkfields=t+" input[type=checkbox]";$radiofields=t+" input[type=radio]";$textareas=t+" textarea";$fields=e($textfields);$drops=e($dropdowns);$checks=e($checkfields);$radios=e($radiofields);$tareas=e($textareas);$curmethod=n[p];if($curmethod["runbefore"]!=undefined){$curmethod["runbefore"].apply()}$tareas.each(function(){var e=[this,i];if(s(this)){$curmethod["valid"].apply(null,e)}else{$curmethod["invalid"].apply(null,e);u=true}});$fields.each(function(){var e=[this,i];if(s(this)){$curmethod["valid"].apply(null,e)}else{$curmethod["invalid"].apply(null,e);u=true}});$drops.each(function(){var e=[this,i];if(r(this)){$curmethod["valid"].apply(null,e)}else{$curmethod["invalid"].apply(null,e);u=true}});$checks.each(function(){var e=[this,i];if(o(this)){$curmethod["valid"].apply(null,e)}else{$curmethod["invalid"].apply(null,e);u=true}});var a=[];$radios.each(function(){if(e.inArray(e(this).attr("name"),a)==-1){a.push(e(this).attr("name"));var t=[this,i];if(o(this)){$curmethod["valid"].apply(null,t)}else{$curmethod["invalid"].apply(null,t);u=true}}});e.ubvalidate.globals[i].bindblurcomplete=true;var f=[i];if($curmethod["runafter"]!=undefined){$curmethod["runafter"].apply(null,f)}if(!u){return true}else return false}var c=e(this);var h=e(this).attr("id");if(!c[0]){alert("ValidationEngine ERROR: The form you are trying to validate does not exist!");return false}if(!e.ubvalidate.globals[h]){f(h)}e("body").css("z-index","0");e.ubvalidate.globals[h].zindex=a(c);if(l){var p;if(l.type==undefined){p="default"}else{p=l.type}if(l.mobile){e.ubvalidate.globals[h].mobile=true}if(l.aliasfields){var d=l.aliasfields;for(i=0;i<d.length;i++){if(t[d[i].mapto]){var v=t[d[i].mapto];t[d[i].name]={regex:v.regex,failtext:v.failtext}}}}}else{p="default"}e("head").append('<link rel="stylesheet" type="text/css" href="http://cache.university-bound.com/validation/validationEngine/ubvalidate.css" />');$formid="#"+e(this).attr("id");$validated=false;e($formid).submit(function(){if($validated){return true}else return false});$sectionstring=$formid+" .form_section";$formsections=e($sectionstring);$selectstatus=$formid+" select";$selectnametest=e($selectstatus);$selectnametest.each(function(){if(e(this).attr("name")==undefined){var t=u();e(this).attr("name",t)}});$inputstatus=$formid+" input[type=text]";$inputnametest=e($inputstatus);$inputnametest.each(function(){if(e(this).attr("name")==undefined){var t=u();e(this).attr("name",t)}});$pageids=[];if($formsections.length!=0){$formsections.each(function(){if(e(this).attr("id")==undefined||e(this).attr("id")==""){var t=u();e(this).attr("id",t)}$pageids.push("#"+e(this).attr("id"))})}else{$pageids.push($formid)}for(i=0;i<$pageids.length;i++){$thispage=$pageids[i];$nextpage=$pageids[i+1];$thisbutton="";if(i==$pageids.length-1){$thisbutton=$thispage+" .submit";e($thisbutton).click(function(t,n,r){return function(){if(m(t,r)){var i=t.replace("#","");if(e.ubvalidate.globals[r][i]){e.ubvalidate.globals[r][i](this)}$validated=true;e(n).submit()}}}($thispage,$formid,h))}else{$thisbutton=$thispage+" .next";e($thisbutton).click(function(t,n,r){return function(){if(m(t,r)){var i=t.replace("#","");if(e.ubvalidate.globals[r][i]){e.ubvalidate.globals[r][i](this)}e(t).slideUp();e(n).slideDown()}}}($thispage,$nextpage,h))}}};e.ubvalidate={globals:{}}})(jQuery)