class ContactsController < ApplicationController
  before_filter :load_contact, :only => [:show, :edit, :update, :destroy, :send_test_message]

  def show
    # loaded by load_contact
  end

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
    # loaded by load_contact
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

  def send_test_message
    @contact.send_message("This is a test of the Geographic Notification System. Had this been an actual geographic emergency, you would have been informed that your house was on fire.")
    flash[:success] = "A test message has been sent."
    redirect_to account_path
  end

  private

  def load_contact
    @contact = current_user.contacts.find(params[:id])
  end

end
