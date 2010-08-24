class SubscriptionsController < ApplicationController
  before_filter :load_subscription, :only => [:show, :edit, :update, :destroy, :send_test_message]

  def show
    # loaded by load_subscriptions
  end

  def new
    @subscriptions = subscriptions.new
  end

  def create
    @subscription = current_user.subscriptions.new(params[:subscription])
     if @subscription.save
      flash[:success] = 'subscriptions method added.'
      redirect_to account_path
    else
      render :action => :new
    end
  end

  def edit
    # loaded by load_subscriptions
  end

  def update
    if @subscription.update_attributes(params[:subscription])
      flash[:success] = "Subscription updated"
      redirect_to account_path
    else
      render :action => :edit
    end
  end

  def destroy
    @subscription.destroy and redirect_to account_path
  end

  def send_test_message
    @subscription.send_message("This is a test of the Geographic Notification System. Had this been an actual geographic emergency, you would have been informed that your house was on fire.")
    flash[:success] = "A test message has been sent."
    redirect_to account_path
  end

  private

  def load_subscription
    @subscription = current_user.subscriptions.find(params[:id])
  end
  
  
end
