define(['jquery', 'jquery.cookie'], function($) {
    $.fn.lead_service = function(options) {
      var caller;

      var form_div = $(this);
      var pre_update_form = function() {
        if (options.show_hide_params) {
          if (options.show_hide_params.last_name_required == "1") {
            $('.lead_last_name', form_div).show();
          } else {
            $('.lead_last_name', form_div).hide();
            $('.lead_first_name label', form_div).html("<em>*</em> Your Name:");
          }

          if (options.show_hide_params.phone_required == "1") {
            $('em#phone_number', form_div).show();
          } else {
            $('em#phone_number', form_div).hide();
          }

          // Show beds & baths if specified
          if (options.show_hide_params.bed_bath_leads == "1") {
            $('.beds_baths', form_div).show();
          } else {
            $('.beds_baths', form_div).hide();
          }

          if (options.show_hide_params.bed_bath_leads_required == "1") {
            $('em#beds', form_div).show();
            $('em#baths', form_div).show();
          } else {
            $('em#beds', form_div).hide();
            $('em#baths', form_div).hide();
          }

          if (options.show_hide_params.show_price_range == "1") {
            $('div.price_range', form_div).show();
          } else {
            $('div.price_range', form_div).hide();
          }
          if (options.show_hide_params.price_range_required == "1") {
            $('em#price_range', form_div).show();
          } else {
            $('em#price_range', form_div).hide();
          }

          if (options.show_hide_params.show_reason_for_move == "1") {
            $('.reason_for_move', form_div).show();
          } else {
            $('.reason_for_move', form_div).hide();
          }
          if (options.show_hide_params.reason_for_move_required == "1") {
            $('em#reason_for_move', form_div).show();
          } else {
            $('em#reason_for_move', form_div).hide();
          }

          if (options.show_hide_params.confirm_email_required == "1") {
            $('.lead_confirm_email', form_div).show();
          } else {
            $('.lead_confirm_email', form_div).hide();
          }

          if (options.show_hide_params.show_move_date == "1") {
            $('.lead_move_date', form_div).show();

            if (options.show_hide_params.move_date_required == "1") {
              $('em#move_date', form_div).show();
            } else {
              $('em#move_date', form_div).hide();
            }

            $('.lead_move_date_preference', form_div).hide();
          } else {
            $('.lead_move_date_preference', form_div).show();

            if (options.show_hide_params.move_date_preference_required == "1") {
              $('em#move_date_preference', form_div).show();
            } else {
              $('em#move_date_preference', form_div).hide();
            }

            $('.lead_move_date', form_div).hide();
          }

          // Show preferred method of contact if specified
          if (options.show_hide_params.preferred_method_of_contact == "1") {
            $('.preferred_method_of_contact', form_div).show();
          } else {
            $('.preferred_method_of_contact', form_div).hide();
          }
        }
      };

      var getCookieObj = function() {
        var cookie = $.cookie('lead');
        if (!cookie) return null;

        var cookieObj = {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          moveDate: '',
          moveDatePreference: '',
          message: '',
          optInBrochure: '',
          optInNewsletter: '',
          beds: '',
          baths: '',
          priceRange: '',
          reasonForMove: '',
          preferredMethodOfContact: ''
        };

        var arr = cookie.split('|');
        var i = 0;

        $.each(cookieObj,
          function(key, val) {
            cookieObj[key] = arr[i];
            i++;
          });

        return cookieObj;
      };

      var updateFromCookies = function() {
        var cookie = getCookieObj();
        var form = form_div.find('form');

        $(".lead_ef_id").val($.cookie('ef_id'));
        $('.lead_search_state').val($.cookie('long_state'));
        $('.lead_search_city').val($.cookie('city'));
        $('.lead_search_zip').val($.cookie('zip'));

        if (cookie) {
          var brochure = cookie.optInBrochure === '1' ? true : false;
          var newsletter = cookie.optInNewsletter === '1' ? true : false;
          form.find('input.lead_opt_in_brochure').attr('checked', brochure);
          form.find('input.lead_opt_in_newsletter').attr('checked', newsletter);
          form.find('input.lead_first_name').val(cookie.firstName.replace(/\+/g, ' '));
          form.find('input.lead_last_name').val(cookie.lastName.replace(/\+/g, ' '));
          form.find('input.lead_email').val(cookie.email);
          form.find('input.lead_phone').val(cookie.phone);
          form.find('input.lead_address').val(cookie.address);
          form.find('input.lead_city').val(cookie.city);
          form.find('input.lead_state').val(cookie.state);
          form.find('input.lead_zip').val(cookie.zip);
          form.find('input.lead_move_date').val(cookie.moveDate);
          form.find('textarea.lead_message').val(cookie.message.replace(/\+/g, ' '));
          form.find("select.lead_move_date_preference>option[value='" + cookie.moveDatePreference + "']").attr("selected", "selected");
          form.find("select.lead_beds>option[value='" + cookie.beds + "']").attr("selected", "selected");
          form.find("select.lead_baths>option[value='" + cookie.baths + "']").attr("selected", "selected");
          form.find("select.lead_price_range>option[value='" + cookie.priceRange + "']").attr("selected", "selected");
          form.find("select.lead_reason_for_move>option[value='" + cookie.reasonForMove.replace(/\+/g, ' ') + "']").attr("selected", "selected");
          form.find("select.lead_preferred_method_of_contact>option[value='" + cookie.preferredMethodOfContact + "']").attr("selected", "selected");
        } else {
          // default to check checkboxes
          form.find('input.lead_opt_in_brochure').attr('checked', true);
          form.find('input.lead_opt_in_newsletter').attr('checked', true);
        }
      };

      var updateFields = function() {
        updateFromCookies();
        opts.update_form();
        opts.populate_fields();
        pre_update_form();
        $('.lead_form', form_div).submit(submitLead);
        form_div.trigger('LeadFormReady');
      };

      var formLoad = function() {
        if (opts.disable_ajax) {
          updateFields();
        } else {
          url = buildNewUrl(opts.form_params);
          form_div.load(url, updateFields);
        }
      };

      var buildNewUrl = function(params) {
        var base = '/v2/leads/new?';
        var uri = '';
        if (params.session_id == undefined) {
          // Use the session ID if provided, otherwise set it to WT.vt_sid
          var session_id = 'webtrends_session';
          if (typeof(WT) != 'undefined' && WT.vt_sid != 'undefined' && WT.vt_sid != "" && WT.vt_sid != null) {
            session_id = WT.vt_sid;
          }
          params.session_id = session_id;
        }

        $.each(params.required_fields, function(k, v) {
          uri += "lead[required_fields][]=" + v + "&";
        });

        delete params.required_fields;

        $.each(params, function(k, v) {
          uri += "lead[" + k + "]=" + v + "&";
        });
        uri = uri.substring(0, uri.length - 1);
        base += encodeURI(uri);
        return base;
      };

      var submitLead = function() {
        caller = $(this);
        var status = 'fail';
        if (this.beenSubmitted) return false;
        caller.trigger('LeadFormSubmitted');
        this.beenSubmitted = true;
        $.ajax({
          url: '/v2/leads/ajax.js',
          type: 'POST',
          data: $(this).serialize(),
          success: function(response) {
            var data = opts.lead_saved();
            $('body').trigger('lead_submission', (data || {}));
          },
          error: function(req, status, err) {
            if(opts.disable_ajax){
              caller[0].beenSubmitted = false;
            }
            opts.lead_error(req, status, err);
          }
        });
        return false;
      };

      var handle_errors = function(req, status, err){
        var parent = caller.parent();
        caller.replaceWith(req.responseText);
        pre_update_form();
        $('.lead_form', parent).submit(submitLead);
        opts.update_form();
        form_div.trigger('LeadFormReady');
        return false;
      };

      var thankYou = function() {
        form_div.html('Thank you!');
      };

      var updateForm = function() {};
      var populateFields = function() {};

      var defaults = {
        update_form:  updateForm,
        populate_fields: populateFields,
        lead_saved:   thankYou,
        lead_error:   handle_errors,
        disable_ajax: false
      };

      var opts = jQuery.extend(defaults, options);

      return this.each(function() {
        formLoad();
      });
    };
});
