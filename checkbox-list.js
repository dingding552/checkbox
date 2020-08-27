import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  init() {
    this._super(...arguments);
    this.set('checkedItemsSet', new Set());




    //
  },
  actions: {

    onCheck(item) {
      let checkedItemsSet = this.get('checkedItemsSet');
      if (checkedItemsSet.has(item)) {
        checkedItemsSet.delete(item);
      } else {
        checkedItemsSet.add(item);
      }
      this.get('onCheck')(Array.from(checkedItemsSet));
    }

  }
});
