class CreateSubscriptions < ActiveRecord::Migration
  def self.up
    create_table :subscriptions do |t|
      t.belongs_to :user
      t.belongs_to :area
      t.belongs_to :schedule
      t.belongs_to :contact
      t.timestamps
    end
  end

  def self.down
    drop_table :subscriptions
  end
end
