class CreateSchedules < ActiveRecord::Migration
  def self.up
    create_table :schedules do |t|
      t.string :name
      t.string :db_name
      t.text :description
      t.text :bounds
      t.timestamps
    end
  end

  def self.down
    drop_table :schedules
  end
end