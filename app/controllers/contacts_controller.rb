class ContactsController < ApplicationController
  before_filter :load_contact, :only => [:edit, :update, :destroy]

  def new
    @contact = Contact.new
  end

  def create
    @contact = current_user.contacts.new(params[:contact])
     if @contact.save
      flash[:success] = 'Contact method added.'
      redirect_to account_path
    else
      render :action => :new
    end
  end

  def edit

  end

  def update
    if @contact.update_attributes(params[:contact])
      flash[:success] = "Contact updated"
      redirect_to account_path
    else
      render :action => :edit
    end
  end

  def destroy
    @contact.destroy and redirect_to account_path
  end

  private

  def load_contact
    @contact = current_user.contacts.find(params[:id])
  end

end
