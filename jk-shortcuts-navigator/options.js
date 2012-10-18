// Generated by CoffeeScript 1.3.3
(function() {
  var OptionPane, SiteView, defaultJSON, valid_keys,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  valid_keys = ['selectors', 'search_selector', 'paginator_selector_next', 'paginator_selector_prev', 'allowSubdomains', 'liveUpdateElement', 'infiniteScroll'];

  defaultJSON = '{\n  "selectors":null,\n  "search_selector":null,\n  "paginator_selector_next":null,\n  "paginator_selector_prev":null,\n  "liveUpdateElement":null,\n  "allowSubdomains":null,\n  "infiniteScroll":null\n}';

  SiteView = (function(_super) {

    __extends(SiteView, _super);

    function SiteView() {
      return SiteView.__super__.constructor.apply(this, arguments);
    }

    SiteView.prototype.tagName = 'li';

    SiteView.prototype.events = {
      'click .title': 'editSite',
      'click .savesite': 'saveSite',
      'click .removesite': 'removeSite',
      'click .discard': 'discardChanges'
    };

    SiteView.prototype.initialize = function(options) {
      this.addnew = options.addnew;
      if (this.model) {
        this.model.bind('change', this.render, this);
        return this.model.bind('destroy', this.remove, this);
      }
    };

    SiteView.prototype.render = function() {
      var context, html, opts;
      if (this.addnew) {
        opts = defaultJSON;
      } else {
        opts = this.model.getOpts();
      }
      context = {
        addnew: this.addnew,
        json_opts: opts
      };
      if (this.model) {
        _.extend(context, this.model.toJSON());
      }
      html = Handlebars.templates.siteitem(context);
      this.$el.html(html);
      if (this.addnew) {
        this.$el.addClass('addnew');
      }
      return this;
    };

    SiteView.prototype.editSite = function() {
      if (this.editMode || this.addnew) {
        return;
      }
      this.editMode = true;
      return this.$el.addClass('editable');
    };

    SiteView.prototype.saveSite = function() {
      var values;
      if (!this.validate()) {
        return;
      }
      this.regex = this.$('input[name=regex]').val();
      values = {
        'site': this.site,
        'opts': this.opts,
        'regex': this.regex,
        'modified': true
      };
      if (!this.model) {
        this.model = Sites.create(values);
      } else {
        this.model.set(values);
        this.model.save();
      }
      if (this.$('input[name=submittojk]').is(':checked')) {
        this.model.submitToJK();
      }
      this.editMode = false;
      this.$el.removeClass('editable');
      if (this.addnew) {
        return this.remove();
      }
    };

    SiteView.prototype.validate = function() {
      var k, opts, _i, _len, _ref;
      this.site = this.$('input[name=site]').val();
      if (!this.site) {
        return false;
      }
      opts = this.$('textarea[name=opts]').val();
      try {
        opts = JSON.parse(opts);
      } catch (error) {
        alert('Invalid JSON');
        return false;
      }
      _ref = _.keys(opts);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        if (valid_keys.indexOf(k) === -1) {
          alert('Unknown Key in Options: ' + k);
          return false;
        }
      }
      this.opts = opts;
      return true;
    };

    SiteView.prototype.removeSite = function() {
      if (this.model) {
        return this.model.destroy();
      } else {
        return this.remove();
      }
    };

    SiteView.prototype.discardChanges = function() {
      this.editMode = false;
      this.$el.removeClass('editable');
      this.site = this.$('input[name=site]').val(this.model.get('site'));
      return this.$('textarea[name=opts]').val(this.model.getOpts());
    };

    return SiteView;

  })(Backbone.View);

  OptionPane = (function(_super) {

    __extends(OptionPane, _super);

    function OptionPane() {
      return OptionPane.__super__.constructor.apply(this, arguments);
    }

    OptionPane.prototype.el = 'body';

    OptionPane.prototype.events = {
      'click .addsite': 'addSite',
      'click .restoresites': 'restoreSites'
    };

    OptionPane.prototype.initialize = function() {
      Sites.bind('add', this.addOne, this);
      Sites.bind('reset', this.addAll, this);
      Sites.bind('all', this.render, this);
      return Sites.fetch();
    };

    OptionPane.prototype.addOne = function(site) {
      var view;
      view = new SiteView({
        model: site
      });
      return this.$(".customsites").prepend(view.render().el);
    };

    OptionPane.prototype.addAll = function() {
      return Sites.each(this.addOne);
    };

    OptionPane.prototype.addSite = function() {
      var view;
      view = new SiteView({
        addnew: true
      });
      return this.$(".customsites").prepend(view.render().el);
    };

    OptionPane.prototype.restoreSites = function() {
      var s, sites, _i, _len;
      sites = Sites.where({
        builtin: true
      });
      for (_i = 0, _len = sites.length; _i < _len; _i++) {
        s = sites[_i];
        s.destroy();
      }
      return Sites.addDefaults();
    };

    return OptionPane;

  })(Backbone.View);

  $(function() {
    var options;
    return options = new OptionPane();
  });

}).call(this);
