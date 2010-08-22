class SchedulesController < ApplicationController
  before_filter :load_schedule, :only => [:show, :edit, :update, :destroy]

  def index
    @schedules = Schedule.all
  end

  def show
    #loaded by load_schedule
  end

  def new
    @schedule = Schedule.new
  end

  def create
    @schedule = Schedule.new(params[:schedule])
     if @schedule.save
      flash[:success] = 'Schedule added.'
      redirect_to account_path
    else
      render :action => :new
    end
  end

  def edit
    # loaded by load_schedule
  end

  def update
    if @schedule.update_attributes(params[:schedule])
      flash[:success] = "Schedule updated."
      redirect_to account_path
    else
      render :action => :edit
    end
  end

  def destroy
    @schedule.destroy and redirect_to account_path
  end

  private

  def load_schedule
    @schedule = Schedule.find(params[:id])
  end
end
