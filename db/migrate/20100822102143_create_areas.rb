class CreateAreas < ActiveRecord::Migration
  def self.up
    create_table :areas do |t|
      t.text :geometry
      t.time :starts_at
      t.time :ends_at
      t.string :name
      t.belongs_to :user
      t.timestamps
    end
  end

  def self.down
    drop_table :areas
  end
end
