class CreateContacts < ActiveRecord::Migration
  def self.up
    create_table :contacts do |t|
      t.string :contact_type
      t.string :value
      t.string :nickname
      t.belongs_to :user

      t.timestamps
    end
  end

  def self.down
    drop_table :contacts
  end
end
